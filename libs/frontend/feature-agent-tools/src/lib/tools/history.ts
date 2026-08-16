import { redoN, undoN } from '@pubstudio/frontend/data-access-command'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { AgentError } from '../result'
import { requireEditable, requireSite } from './session'

export interface IHistoryInput {
  action: 'undo' | 'redo' | 'list'
  n?: number
}

export interface IHistoryEntry {
  type: CommandType
  label?: string
  commands?: CommandType[]
}

export interface IHistoryOutput {
  depth: number
  redoDepth: number
  undone?: number
  redone?: number
  recent?: IHistoryEntry[]
}

const entry = (command: ICommand): IHistoryEntry => {
  if (command.type !== CommandType.Group) {
    return { type: command.type }
  }
  const group = command.data as ICommandGroupData
  return {
    type: command.type,
    label: group.label,
    commands: group.commands.map((c) => c.type),
  }
}

export const history = (input: IHistoryInput): IHistoryOutput => {
  const site = requireSite()
  const n = input?.n ?? (input?.action === 'list' ? 10 : 1)
  if (input?.action === 'list') {
    return {
      depth: site.history.back.length,
      redoDepth: site.history.forward.length,
      recent: site.history.back.slice(-n).reverse().map(entry),
    }
  }
  requireEditable()
  if (input?.action === 'undo') {
    const count = Math.min(n, site.history.back.length)
    undoN(site, count)
    return {
      depth: site.history.back.length,
      redoDepth: site.history.forward.length,
      undone: count,
    }
  }
  if (input?.action === 'redo') {
    const count = Math.min(n, site.history.forward.length)
    redoN(site, count)
    return {
      depth: site.history.back.length,
      redoDepth: site.history.forward.length,
      redone: count,
    }
  }
  throw new AgentError('INVALID_INPUT', 'action must be "undo", "redo" or "list".')
}
