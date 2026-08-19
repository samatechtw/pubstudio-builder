import {
  anyOf,
  arr,
  bool,
  json,
  lazySchema,
  num,
  obj,
  oneOf,
  parseSchema,
  record,
  referencedDefs,
  Schema,
  str,
} from './schema'

describe('Schema', () => {
  const schema = obj({
    name: str().desc('A name'),
    count: num().optional(),
    tags: arr(str()).optional(),
    mode: oneOf(['fast', 'slow'] as const).dflt('fast'),
    meta: record(json()).optional(),
    on: bool().optional(),
  })

  it('accepts valid input and keeps optional fields undefined', () => {
    const result = parseSchema(schema, { name: 'hero', tags: ['a'] })
    expect(result).toEqual({
      ok: true,
      value: {
        name: 'hero',
        count: undefined,
        tags: ['a'],
        mode: undefined,
        meta: undefined,
        on: undefined,
      },
    })
  })

  it('reports missing required fields with a path', () => {
    const result = parseSchema(schema, {}, 'ops[0].input')
    expect(result).toEqual({
      ok: false,
      issues: [{ path: 'ops[0].input.name', message: 'is required' }],
    })
  })

  it('reports wrong types and bad enum values', () => {
    const result = parseSchema(schema, { name: 1, mode: 'medium' })
    expect(result.ok).toEqual(false)
    expect(!result.ok && result.issues.map((i) => i.path)).toEqual(['name', 'mode'])
  })

  it('rejects unknown fields so typos surface', () => {
    const result = parseSchema(schema, { name: 'hero', colour: 'red' })
    expect(result.ok).toEqual(false)
    expect(!result.ok && result.issues[0].message).toContain('unknown field')
  })

  it('reports issue paths inside arrays', () => {
    const result = parseSchema(schema, { name: 'hero', tags: ['a', 2] })
    expect(!result.ok && result.issues[0].path).toEqual('tags[1]')
  })

  it('emits JSON Schema with required, enums and descriptions', () => {
    expect(schema.toJson()).toEqual({
      type: 'object',
      additionalProperties: false,
      required: ['name'],
      properties: {
        name: { type: 'string', description: 'A name' },
        count: { type: 'number' },
        tags: { type: 'array', items: { type: 'string' } },
        mode: { type: 'string', enum: ['fast', 'slow'], default: 'fast' },
        meta: { type: 'object', additionalProperties: {} },
        on: { type: 'boolean' },
      },
    })
  })

  it('emits a named enum as a $ref and resolves it through referencedDefs', () => {
    const named = obj({
      unit: oneOf(['px', 'em', 'rem'] as const, 'lengthUnit').desc('Unit'),
      plain: oneOf(['a', 'b'] as const).optional(),
    })
    expect(named.toJson()).toEqual({
      type: 'object',
      additionalProperties: false,
      required: ['unit'],
      properties: {
        unit: { $ref: '#/$defs/lengthUnit', description: 'Unit' },
        plain: { type: 'string', enum: ['a', 'b'] },
      },
    })
    expect(referencedDefs([named.toJson()])).toEqual({
      lengthUnit: { type: 'string', enum: ['px', 'em', 'rem'] },
    })
    expect(referencedDefs([{ type: 'string' }])).toBeUndefined()
  })

  it('validates a named enum the same as an inline one', () => {
    const named = obj({ unit: oneOf(['px', 'em'] as const, 'lengthUnit2') })
    expect(parseSchema(named, { unit: 'px' })).toEqual({
      ok: true,
      value: { unit: 'px' },
    })
    expect(parseSchema(named, { unit: 'pt' }).ok).toEqual(false)
  })

  it('emits and validates alternative shapes', () => {
    const alternative = anyOf(bool(), arr(str()))
    expect(alternative.toJson()).toEqual({
      anyOf: [{ type: 'boolean' }, { type: 'array', items: { type: 'string' } }],
    })
    expect(parseSchema(alternative, true).ok).toEqual(true)
    expect(parseSchema(alternative, ['one', 'two']).ok).toEqual(true)
    expect(parseSchema(alternative, 2)).toEqual({
      ok: false,
      issues: [{ path: '', message: 'did not match any allowed shape' }],
    })
  })

  describe('lazySchema recursion', () => {
    interface INode {
      label: string
      items?: INode[]
    }
    const node: Schema<INode> = lazySchema('specNode', (self) =>
      obj({ label: str(), items: arr(self).optional() }),
    )

    it('emits a $ref at the use site and the finite definition once', () => {
      expect(node.toJson()).toEqual({ $ref: '#/$defs/specNode' })
      expect(referencedDefs([node.toJson()])).toEqual({
        specNode: {
          type: 'object',
          additionalProperties: false,
          required: ['label'],
          properties: {
            label: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/$defs/specNode' } },
          },
        },
      })
    })

    it('validates recursively with full issue paths', () => {
      expect(
        parseSchema(node, {
          label: 'a',
          items: [{ label: 'b', items: [{ label: 'c' }] }],
        }).ok,
      ).toEqual(true)
      expect(parseSchema(node, { label: 'a', items: [{ items: [] }] })).toEqual({
        ok: false,
        issues: [{ path: 'items[0].label', message: 'is required' }],
      })
      expect(
        parseSchema(node, { label: 'a', items: [{ label: 'b', extra: 1 }] }).ok,
      ).toEqual(false)
    })

    it('collects defs referenced from inside other defs, terminating on cycles', () => {
      oneOf(['x', 'y'] as const, 'specUnit')
      const wrapper = lazySchema('specWrapper', () =>
        obj({
          unit: oneOf(['x', 'y'] as const, 'specUnit').optional(),
          child: node.optional(),
        }),
      )
      const defs = referencedDefs([wrapper.toJson()])
      expect(Object.keys(defs ?? {}).sort()).toEqual([
        'specNode',
        'specUnit',
        'specWrapper',
      ])
    })
  })
})
