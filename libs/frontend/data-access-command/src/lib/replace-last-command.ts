import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { getLastCommand, pushCommandObject } from './command'
import { withoutScaffolding } from './custom-component/arena-history'
import { optimizeCommandGroup } from './optimize-command-group'
import { saveSite } from './save-site'

// Applies a command and replaces the last command on the command stack
export const replaceLastCommand = (site: ISite, command: ICommand, save?: boolean) => {
  const cmd = optimizeCommandGroup(command)
  if (cmd) {
    const history = site.history
    const recorded = withoutScaffolding(site, cmd)
    applyCommand(site, cmd)
    if (recorded) {
      const lastIndex = history.back.length - 1
      if (lastIndex >= 0) {
        history.back[lastIndex] = recorded
      } else {
        history.back.push(recorded)
      }
    }
    if (save ?? true) {
      saveSite(site)
    }
  }
}

// Replace the last command with a Group, and append a command to it
export const appendLastCommand = (site: ISite, command: ICommand, save?: boolean) => {
  const lastCmd = getLastCommand(site)
  const recorded = withoutScaffolding(site, command)
  if (!recorded) {
    applyCommand(site, command)
    if (save ?? true) {
      saveSite(site)
    }
    return
  }
  if (!lastCmd) {
    return
  }
  applyCommand(site, command)
  let newCmd: ICommand
  if (lastCmd.type === CommandType.Group) {
    newCmd = lastCmd
  } else {
    const newData: ICommandGroupData = { commands: [lastCmd] }
    newCmd = { type: CommandType.Group, data: newData }
  }
  const newCommands = (newCmd.data as ICommandGroupData).commands
  if (recorded.type === CommandType.Group) {
    newCommands.push(...(recorded.data as ICommandGroupData).commands)
  } else {
    newCommands.push(recorded)
  }
  site.history.back[site.history.back.length - 1] = newCmd
  if (save ?? true) {
    saveSite(site)
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
