import { CommandType } from '@pubstudio/shared/type-command'
import { isOp, OpEntry } from '../op/define-op'
import { agentOps, findOp, OP_REGISTRY } from '../op/op-registry'
import { READ_INPUT_SCHEMA } from '../read/input'
import { AgentError } from '../result'
import { JsonSchema, referencedDefs } from '../schema/schema'

export interface IToolDoc {
  name: string
  title: string
  description: string
  /** Concrete call, for the tools whose argument shape is not obvious from prose. */
  example?: unknown
}

export interface IOpSummary {
  name: string
  title: string
  command: CommandType
}

export interface IOpDoc extends IOpSummary {
  description: string
  input: JsonSchema
  /** Command data fields the resolver computes rather than taking from input. */
  derived: string[]
  /** Command data fields the op refuses to expose, and why. */
  omitted: Record<string, string>
}

export interface IDescribeToc {
  version: number
  tools: IToolDoc[]
  ops: IOpSummary[]
  excludedCommands: Record<string, string>
}

export interface IDescribeResult extends Partial<IDescribeToc> {
  version: number
  $defs?: Record<string, JsonSchema>
  opDetails?: IOpDoc[]
  readInput?: JsonSchema
}

export const AGENT_TOOLS_VERSION = 1

export const TOOL_DOCS: IToolDoc[] = [
  {
    name: 'identify',
    title: 'Identify the agent',
    description:
      'Required first call, and again after every page reload. ' +
      'identify({client, model, skill}) returns an orientation payload: site name, pages, ' +
      'breakpoint ids, theme variables, id conventions and this table of contents.',
  },
  {
    name: 'describeTools',
    title: 'Describe tools and ops',
    description:
      'describeTools() returns this table of contents (ToC). Request focused JSON Schemas with ' +
      'describeTools({ops:["setComponentStyle"]}) or describeTools({read:true}); add toc:true for ToC. ' +
      'describeTools({all:true}) returns everything. Long enums (CSS properties, tags, ARIA roles) are emitted once in `$defs` and ' +
      'referenced as {"$ref":"#/$defs/name"}. Treat it as the only tool contract — never guess a signature.',
  },
  {
    name: 'read',
    title: 'Read the site',
    description:
      'read(selectors) returns scoped views of the site. Selectors: site, tree, components, ' +
      'styles, find, mixins, theme, behaviors, i18n, head, builtins, html, history. ' +
      'Call describeTools({read:true}) for their JSON Schema. Reads are scoped on purpose — ' +
      'never pull the whole site into context.',
  },
  {
    name: 'apply',
    title: 'Apply a batch of edits',
    description:
      'ASYNC — apply() returns a Promise, so await it; every other tool here returns ' +
      'synchronously. Each entry of `ops` is an envelope {op, input}, NOT the op fields ' +
      'inline: {op:"addThemeVariable", input:{key, value}}. See `example`. ' +
      'apply({ops, label, save}) validates every op, then applies them in order and ' +
      'records the batch as ONE undo step. Returns created ids and warnings. On a ' +
      'resolver failure it reports ok:false with result.partial — ops before failedIndex ' +
      'are applied and are part of that single undo step. Check result.saveError: a ' +
      'failed save does NOT make ok false.',
    example: {
      ops: [
        { op: 'addThemeVariable', input: { key: 'color-accent', value: '#ff6600' } },
        {
          op: 'setComponentStyle',
          input: { componentId: '<id>', property: 'color', value: '${color-accent}' },
        },
      ],
      label: 'accent colour',
    },
  },
  {
    name: 'history',
    title: 'Undo, redo, inspect',
    description:
      'history({action:"undo"|"redo"|"list", n}) walks the same undo stack the user’s ' +
      'Ctrl+Z uses. One apply() call is one step.',
  },
  {
    name: 'status',
    title: 'Cheap status poll',
    description:
      'status() returns readiness, editability, save state, storage kind, active page ' +
      'and history depth without serializing any site content. `lastSaveError` and ' +
      '`lastSavedAt` are the save signals to trust — `saveState` is a lifecycle enum ' +
      'that reads `saved` even when the last write was rejected.',
  },
]

const opSummary = (entry: OpEntry): IOpSummary | undefined =>
  isOp(entry)
    ? { name: entry.name, title: entry.title, command: entry.command }
    : undefined

const opDoc = (name: string): IOpDoc => {
  const op = findOp(name)
  if (!op) {
    throw new AgentError(
      'NOT_FOUND',
      `No op named "${name}". Call describeTools() for the full list.`,
    )
  }
  return {
    name: op.name,
    title: op.title,
    command: op.command,
    description: op.description,
    input: op.input.toJson(),
    derived: [...op.derived] as string[],
    omitted: { ...op.omitted },
  }
}

export const describeToc = (): IDescribeToc => {
  const excludedCommands: Record<string, string> = {}
  for (const [command, entry] of Object.entries(OP_REGISTRY)) {
    if (!isOp(entry)) {
      excludedCommands[command] = entry.reason
    }
  }
  return {
    version: AGENT_TOOLS_VERSION,
    tools: TOOL_DOCS,
    ops: agentOps().map(opSummary).filter(Boolean) as IOpSummary[],
    excludedCommands,
  }
}

export interface IDescribeInput {
  ops?: string[]
  /** Include the JSON Schema for read() selectors. */
  read?: boolean
  all?: boolean
  /** Include the table of contents. Defaults to false for a focused schema request. */
  toc?: boolean
}

export const describeTools = (input?: IDescribeInput): IDescribeResult => {
  const named = !input?.all && (!!input?.ops?.length || !!input?.read)
  const opDetails = input?.all
    ? agentOps().map((op) => opDoc(op.name))
    : named
      ? input.ops?.map(opDoc)
      : undefined
  const readInput = input?.all || input?.read ? READ_INPUT_SCHEMA.toJson() : undefined
  const includeToc = input?.toc ?? !named
  // Exclude ToC unless asked for
  const head: IDescribeResult = includeToc
    ? describeToc()
    : { version: AGENT_TOOLS_VERSION }
  if (!opDetails && !readInput) {
    return head
  }
  const schemas = [
    ...(opDetails?.map((op) => op.input) ?? []),
    ...(readInput ? [readInput] : []),
  ]
  const defs = referencedDefs(schemas)
  return {
    ...head,
    ...(defs ? { $defs: defs } : {}),
    ...(opDetails ? { opDetails } : {}),
    ...(readInput ? { readInput } : {}),
  }
}
