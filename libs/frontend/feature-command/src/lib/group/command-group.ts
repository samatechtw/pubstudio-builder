import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from '../apply-command'
import { undoCommand } from '../undo-command'

export const applyCommandGroup = (site: ISite, data: ICommandGroupData) => {
  for (const command of data.commands) {
    applyCommand(site, command)
  }
}

export const undoCommandGroup = (site: ISite, data: ICommandGroupData) => {
  for (let i = data.commands.length - 1; i >= 0; i -= 1) {
    undoCommand(site, data.commands[i])
  }
}
