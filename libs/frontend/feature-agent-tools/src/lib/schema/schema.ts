// A tiny schema DSL that emits JSON Schema and validates plain JSON input.
//
// It exists instead of a validation dependency because the only consumers are agent op
// definitions, which need three things: TypeScript inference for `resolve`, JSON Schema
// for `describeTools()`, and issue paths precise enough for an agent to self-correct.

export type JsonSchema = Record<string, unknown>

export interface IIssue {
  path: string
  message: string
}

type Check<T> = (value: unknown, path: string, issues: IIssue[]) => T

export class Schema<T> {
  constructor(
    private readonly json: JsonSchema,
    private readonly check: Check<T>,
    readonly isOptional = false,
  ) {}

  desc(text: string): Schema<T> {
    return new Schema({ ...this.json, description: text }, this.check, this.isOptional)
  }

  // Marks the field optional and documents the value the op falls back to.
  // Ops apply the fallback themselves; this only annotates.
  dflt(value: unknown): Schema<T | undefined> {
    return new Schema<T | undefined>({ ...this.json, default: value }, this.check, true)
  }

  optional(): Schema<T | undefined> {
    return new Schema<T | undefined>(this.json, this.check, true)
  }

  toJson(): JsonSchema {
    return this.json
  }

  parse(value: unknown, path: string, issues: IIssue[]): T {
    if (value === undefined || value === null) {
      if (!this.isOptional) {
        issues.push({ path, message: 'is required' })
      }
      return undefined as T
    }
    return this.check(value, path, issues)
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySchema = Schema<any>

export type Infer<S> = S extends Schema<infer T> ? T : never

type OptionalKeys<T> = { [K in keyof T]-?: undefined extends T[K] ? K : never }[keyof T]

// Turns `{ a: string; b: string | undefined }` into `{ a: string; b?: string }`
type WithOptional<T> = Omit<T, OptionalKeys<T>> & Partial<Pick<T, OptionalKeys<T>>>

export type Shape = Record<string, AnySchema>

export type InferShape<Sh extends Shape> = WithOptional<{
  [K in keyof Sh]: Infer<Sh[K]>
}>

const primitive = <T>(type: string, jsType: string): Schema<T> =>
  new Schema<T>({ type }, (value, path, issues) => {
    if (typeof value !== jsType) {
      issues.push({ path, message: `expected ${type}, got ${typeof value}` })
    }
    return value as T
  })

export const str = (): Schema<string> => primitive<string>('string', 'string')

export const num = (): Schema<number> => primitive<number>('number', 'number')

export const bool = (): Schema<boolean> => primitive<boolean>('boolean', 'boolean')

// Accepts any JSON value; used where the site model itself is unconstrained
export const json = (): Schema<unknown> => new Schema<unknown>({}, (value) => value)

export const MAX_LISTED_OPTIONS = 12

const SCHEMA_DEFS: Record<string, JsonSchema> = {}

const DEFS_PREFIX = '#/$defs/'

const collectRefs = (schema: unknown, into: Set<string>): void => {
  if (Array.isArray(schema)) {
    schema.forEach((entry) => collectRefs(entry, into))
  } else if (schema && typeof schema === 'object') {
    for (const [key, value] of Object.entries(schema)) {
      if (key === '$ref' && typeof value === 'string' && value.startsWith(DEFS_PREFIX)) {
        into.add(value.slice(DEFS_PREFIX.length))
      } else {
        collectRefs(value, into)
      }
    }
  }
}

export const referencedDefs = (
  schemas: unknown[],
): Record<string, JsonSchema> | undefined => {
  const names = new Set<string>()
  schemas.forEach((schema) => collectRefs(schema, names))
  if (!names.size) {
    return undefined
  }
  const defs: Record<string, JsonSchema> = {}
  for (const name of [...names].sort()) {
    defs[name] = SCHEMA_DEFS[name]
  }
  return defs
}

// Long enums (every CSS property, every tag) would flood the agent's context, so list
// near misses instead and point at the schema for the rest.
const enumMessage = (values: readonly string[], value: unknown): string => {
  if (values.length <= MAX_LISTED_OPTIONS) {
    return `expected one of: ${values.join(', ')}`
  }
  const text = typeof value === 'string' ? value.toLowerCase() : ''
  const near = values.filter(
    (option) => text.length > 1 && (option.includes(text) || text.includes(option)),
  )
  const hint = near.length
    ? `did you mean: ${near.slice(0, MAX_LISTED_OPTIONS).join(', ')}?`
    : `e.g. ${values.slice(0, 5).join(', ')}`
  return `not one of the ${values.length} allowed values — ${hint} See describeTools() for the full list.`
}

export const oneOf = <const T extends readonly string[]>(
  values: T,
  // Required for any list longer than MAX_LISTED_OPTIONS
  defName?: string,
): Schema<T[number]> => {
  const check: Check<T[number]> = (value, path, issues) => {
    if (typeof value !== 'string' || !values.includes(value)) {
      issues.push({ path, message: enumMessage(values, value) })
    }
    return value as T[number]
  }
  if (!defName) {
    return new Schema<T[number]>({ type: 'string', enum: values }, check)
  }
  SCHEMA_DEFS[defName] = { type: 'string', enum: values }
  return new Schema<T[number]>({ $ref: `${DEFS_PREFIX}${defName}` }, check)
}

export const anyOf = <const S extends readonly AnySchema[]>(
  ...schemas: S
): Schema<Infer<S[number]>> =>
  new Schema<Infer<S[number]>>(
    { anyOf: schemas.map((schema) => schema.toJson()) },
    (value, path, issues) => {
      for (const schema of schemas) {
        const branchIssues: IIssue[] = []
        const parsed = schema.parse(value, path, branchIssues)
        if (!branchIssues.length) {
          return parsed as Infer<S[number]>
        }
      }
      issues.push({ path, message: 'did not match any allowed shape' })
      return value as Infer<S[number]>
    },
  )

export const arr = <S extends AnySchema>(item: S): Schema<Infer<S>[]> =>
  new Schema<Infer<S>[]>(
    { type: 'array', items: item.toJson() },
    (value, path, issues) => {
      if (!Array.isArray(value)) {
        issues.push({ path, message: 'expected array' })
        return []
      }
      return value.map((entry, i) => item.parse(entry, `${path}[${i}]`, issues))
    },
  )

export const record = <S extends AnySchema>(value: S): Schema<Record<string, Infer<S>>> =>
  new Schema<Record<string, Infer<S>>>(
    { type: 'object', additionalProperties: value.toJson() },
    (input, path, issues) => {
      if (typeof input !== 'object' || input === null || Array.isArray(input)) {
        issues.push({ path, message: 'expected object' })
        return {}
      }
      const out: Record<string, Infer<S>> = {}
      for (const [key, entry] of Object.entries(input)) {
        out[key] = value.parse(entry, `${path}.${key}`, issues)
      }
      return out
    },
  )

export const obj = <Sh extends Shape>(shape: Sh): Schema<InferShape<Sh>> => {
  const properties: JsonSchema = {}
  const required: string[] = []
  for (const [key, field] of Object.entries(shape)) {
    properties[key] = field.toJson()
    if (!field.isOptional) {
      required.push(key)
    }
  }
  const jsonSchema: JsonSchema = {
    type: 'object',
    properties,
    additionalProperties: false,
  }
  if (required.length) {
    jsonSchema.required = required
  }
  return new Schema<InferShape<Sh>>(jsonSchema, (value, path, issues) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      issues.push({ path, message: 'expected object' })
      return {} as InferShape<Sh>
    }
    const input = value as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [key, field] of Object.entries(shape)) {
      out[key] = field.parse(input[key], path ? `${path}.${key}` : key, issues)
    }
    for (const key of Object.keys(input)) {
      if (!(key in shape)) {
        issues.push({
          path: path ? `${path}.${key}` : key,
          message: `unknown field; expected one of: ${Object.keys(shape).join(', ')}`,
        })
      }
    }
    return out as InferShape<Sh>
  })
}

export interface IParseSuccess<T> {
  ok: true
  value: T
}

export interface IParseFailure {
  ok: false
  issues: IIssue[]
}

export const parseSchema = <T>(
  schema: Schema<T>,
  value: unknown,
  path = '',
): IParseSuccess<T> | IParseFailure => {
  const issues: IIssue[] = []
  const parsed = schema.parse(value, path, issues)
  return issues.length ? { ok: false, issues } : { ok: true, value: parsed }
}
