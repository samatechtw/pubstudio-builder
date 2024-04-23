import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { getLastCommand, pushCommandObject } from './command'
import { optimizeCommandGroup } from './optimize-command-group'

// Applies a command and replaces the last command on the command stack
export const replaceLastCommand = (site: ISite, command: ICommand, save?: boolean) => {
  const cmd = optimizeCommandGroup(command)
  if (cmd) {
    const history = site.history
    applyCommand(site, command)
    history.back[history.back.length - 1] = command
    if (save ?? true) {
      site.editor?.store?.save(site)
    }
  }
}

// Replace the last command with a Group, and append a command to it
export const appendLastCommand = (site: ISite, command: ICommand, save?: boolean) => {
  const lastCmd = getLastCommand(site)
  if (lastCmd) {
    let newCmd: ICommand
    if (lastCmd.type === CommandType.Group) {
      newCmd = lastCmd
    } else {
      const newData: ICommandGroupData = { commands: [lastCmd] }
      newCmd = { type: CommandType.Group, data: newData }
    }
    if (command.type === CommandType.Group) {
      ;(newCmd.data as ICommandGroupData).commands.push(
        ...(command.data as ICommandGroupData).commands,
      )
    } else {
      ;(newCmd.data as ICommandGroupData).commands.push(command)
    }
    const history = site.history
    applyCommand(site, command)
    history.back[history.back.length - 1] = newCmd
    if (save ?? true) {
      site.editor?.store?.save(site)
    }
  }
}

export const pushOrReplaceCommand = (
  site: ISite,
  command: ICommand,
  replace: boolean,
) => {
  if (replace) {
    replaceLastCommand(site, command)
  } else {
    pushCommandObject(site, command)
  }
}
