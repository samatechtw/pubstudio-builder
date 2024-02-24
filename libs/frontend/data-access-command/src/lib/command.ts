import { store } from '@pubstudio/frontend/data-access-web-store'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  IUpdateUiData,
  UiAction,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { getLastCommandHelper } from './command-helpers'
import { optimizeCommandGroup } from './optimize-command-group'
import { undoCommand } from './undo-command'

// Helper for pushing a command to separate siteStore.save
const pushCommandHelper = (site: ISite, command: ICommand, clearRedo = true) => {
  const cmd = optimizeCommandGroup(command)
  const { editingMixinData } = site.editor ?? {}

  if (store.version.activeVersionId.value) {
    return
  }

  // Push a command to close mixin menu for user when necessary
  if (editingMixinData && shouldCloseMixinMenuForUser(cmd)) {
    const closeMixinMenuCommand: ICommand<IUpdateUiData<UiAction.CloseMixinMenu>> = {
      type: CommandType.UpdateUi,
      data: {
        action: UiAction.CloseMixinMenu,
        params: {
          mixinId: editingMixinData?.mixinId as string,
          originComponentId: editingMixinData?.originComponentId,
        },
      },
    }
    applyCommand(site, closeMixinMenuCommand)
    site.history.back.push(closeMixinMenuCommand)
  }

  if (cmd) {
    applyCommand(site, cmd)
    site.history.back.push(cmd)
    if (clearRedo) {
      site.history.forward = []
    }
  }
}

const commandsInGroup = (command: ICommand, commandTypes: CommandType[]): boolean => {
  if (command.type === CommandType.Group) {
    const groupCommands = command.data as ICommandGroupData
    return groupCommands.commands.some((cmd) => commandTypes.includes(cmd.type))
  }
  return false
}

const shouldCloseMixinMenuForUser = (newCmd: ICommand | undefined): boolean => {
  const mixinCommands = [CommandType.SetMixinEntry, CommandType.EditStyleMixin]
  if (
    !newCmd ||
    mixinCommands.includes(newCmd.type) ||
    commandsInGroup(newCmd, mixinCommands)
  ) {
    return false
  } else if (newCmd.type !== CommandType.UpdateUi) {
    return true
  } else {
    const updateUiData = newCmd.data as IUpdateUiData
    return updateUiData.action !== UiAction.CloseMixinMenu
  }
}

// Applies a command and pushes it to the history stack
export const pushCommand = <Data>(
  site: ISite,
  type: CommandType,
  data: Data,
  clearRedo = true,
) => {
  pushCommandObject(site, { type, data }, clearRedo)
}

export const pushCommandObject = (site: ISite, command: ICommand, clearRedo = true) => {
  pushCommandHelper(site, command, clearRedo)
  site.editor?.store?.save(site)
}

export const getLastCommand = (site: ISite): ICommand | undefined => {
  return getLastCommandHelper(site)
}

// Helper for undoing the last command, to separate siteStore.save
const undoLastCommandHelper = (site: ISite) => {
  const history = site.history
  const command = history.back.pop()
  if (command) {
    undoCommand(site, command)
    history.forward.push(command)
  }
}

export const undoLastCommand = (site: ISite) => {
  undoLastCommandHelper(site)
  site.editor?.store?.save(site)
}

export const undoN = (site: ISite, n: number) => {
  for (let i = 0; i < n; i += 1) {
    undoLastCommand(site)
  }
  site.editor?.store?.save(site)
}

// Redo the most recent un-done command
export const redoCommand = (site: ISite) => {
  const command = site.history.forward.pop()
  if (command) {
    pushCommandObject(site, command, false)
  }
}

// Redo the N most recent un-done commands
export const redoN = (site: ISite, n: number) => {
  for (let i = 0; i < n; i += 1) {
    const command = site.history.forward.pop()
    if (command) {
      pushCommandHelper(site, command, false)
    }
  }
  site.editor?.store?.save(site)
}

// Clear all undo/redo history
export const clearAll = (site: ISite) => {
  site.history.back = []
  site.history.forward = []
  site.editor?.store?.save(site)
}

// Clear a percentage of undo history
// `percent` is a decimal number between 0 and 1
export const clearPartial = (site: ISite, percent: number) => {
  const back = site.history.back
  const clearCount = Math.floor(back.length * percent)
  if (clearCount < back.length) {
    site.history.back = back.slice(clearCount, back.length)
    console.log(`Cleared ${clearCount} items from history`)
    site.editor?.store?.save(site)
  }
}
