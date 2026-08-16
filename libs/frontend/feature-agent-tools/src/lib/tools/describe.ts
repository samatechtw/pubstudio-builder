import { CommandType } from '@pubstudio/shared/type-command'
import { isOp, OpEntry } from '../op/define-op'
import { agentOps, findOp, OP_REGISTRY } from '../op/op-registry'
import { JsonSchema } from '../schema/schema'
import { AgentError } from '../result'

export interface IToolDoc {
  name: string
  title: string
  description: string
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

export interface IDescribeResult extends IDescribeToc {
  opDetails?: IOpDoc[]
}

export const AGENT_TOOLS_VERSION = 1

export const TOOL_DOCS: IToolDoc[] = [
  {
    name: 'identify',
    title: 'Identify the agent',
    description:
      'Required first call. identify({client, model, skill}) returns an orientation ' +
      'payload: site name, pages, breakpoint ids, theme variables, id conventions and ' +
      'this table of contents.',
  },
  {
    name: 'describe',
    title: 'Describe tools and ops',
    description:
      'describe() returns this table of contents. describe({ops:["setComponentStyle"]}) ' +
      'returns full JSON Schemas for those ops. describe({all:true}) returns everything. ' +
      'Treat it as the only op reference — never guess an op signature.',
  },
  {
    name: 'read',
    title: 'Read the site',
    description:
      'read(selector) returns one view of the site. Selectors: site, tree, components, ' +
      'styles, find, mixins, theme, behaviors, i18n, head, builtins, html, history. ' +
      'Reads are scoped on purpose — never pull the whole site into context.',
  },
  {
    name: 'apply',
    title: 'Apply a batch of edits',
    description:
      'apply({ops, label, save}) validates every op, then applies them in order and ' +
      'records the batch as ONE undo step. Returns created ids and warnings. On a ' +
      'resolver failure it reports ok:false with result.partial — ops before failedIndex ' +
      'are applied and are part of that single undo step.',
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
      'and history depth without serializing any site content.',
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
      `No op named "${name}". Call describe() for the full list.`,
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
  all?: boolean
}

export const describe = (input?: IDescribeInput): IDescribeResult => {
  const toc = describeToc()
  if (input?.all) {
    return { ...toc, opDetails: agentOps().map((op) => opDoc(op.name)) }
  }
  if (input?.ops?.length) {
    return { ...toc, opDetails: input.ops.map(opDoc) }
  }
  return toc
}
