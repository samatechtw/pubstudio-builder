import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { applyCommand } from './apply-command'
import { getLastCommandHelper, mergeLastCommandHelper } from './command-helpers'
import { undoCommand } from './undo-command'

const { site, siteStore } = useSiteSource()

// Helper for pushing a command to separate siteStore.save
const pushCommandHelper = <Data>(command: ICommand, clearRedo = true) => {
  // Unwrap a group of 1 command to improve performance
  if (command.type === CommandType.Group) {
    const { commands } = command.data as ICommandGroupData
    if (commands.length === 1) {
      command.type = commands[0].type
      command.data = commands[0].data as Data
    }
  }

  applyCommand(site.value, command)
  site.value.history.back.push(command)
  if (clearRedo) {
    site.value.history.forward = []
  }
}

// Applies a command and pushes it to the history stack
export const pushCommand = <Data>(type: CommandType, data: Data, clearRedo = true) => {
  pushCommandObject({ type, data }, clearRedo)
}

export const pushCommandObject = (command: ICommand, clearRedo = true) => {
  pushCommandHelper(command, clearRedo)
  siteStore.value?.save(site.value)
}

// Applies a command and replaces the last command on the command stack
export const replaceLastCommand = (command: ICommand, save?: boolean) => {
  const history = site.value.history
  applyCommand(site.value, command)
  history.back[history.back.length - 1] = command
  if (save) {
    siteStore.value?.save(site.value)
  }
}

// Groups a list of commands with the previous command
export const mergeLastCommand = (commands: ICommand[]) => {
  mergeLastCommandHelper(site.value, commands)
  siteStore.value?.save(site.value)
}

export const getLastCommand = (): ICommand | undefined => {
  return getLastCommandHelper(site.value)
}

// Helper for undoing the last command, to separate siteStore.save
const undoLastCommandHelper = () => {
  const history = site.value.history
  const command = history.back.pop()
  if (command) {
    undoCommand(site.value, command)
    history.forward.push(command)
  }
}

export const undoLastCommand = () => {
  undoLastCommandHelper()
  siteStore.value?.save(site.value)
}

export const undoN = (n: number) => {
  for (let i = 0; i < n; i += 1) {
    undoLastCommand()
  }
  siteStore.value?.save(site.value)
}

// Redo the most recent un-done command
export const redoCommand = () => {
  const command = site.value.history.forward.pop()
  if (command) {
    pushCommandObject(command, false)
  }
}

// Redo the N most recent un-done commands
export const redoN = (n: number) => {
  for (let i = 0; i < n; i += 1) {
    const command = site.value.history.forward.pop()
    if (command) {
      pushCommandHelper(command, false)
    }
  }
  siteStore.value?.save(site.value)
}

// Clear all undo/redo history
export const clearAll = () => {
  site.value.history.back = []
  site.value.history.forward = []
  siteStore.value?.save(site.value)
}

// Clear a percentage of undo/redo history
// `percent` is a decimal number between 0 and 1
export const clearPartial = (percent: number) => {
  const back = site.value.history.back
  const clearCount = Math.floor(back.length * percent)
  if (clearCount < back.length) {
    site.value.history.back = back.slice(0, -1 * clearCount)
    console.log(`Cleared ${clearCount} items from history`)
    siteStore.value?.save(site.value)
  }
}
