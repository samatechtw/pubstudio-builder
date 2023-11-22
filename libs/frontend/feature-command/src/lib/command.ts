import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ICommandGroupData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { getLastCommandHelper, mergeLastCommandHelper } from './command-helpers'
import { undoCommand } from './undo-command'

export interface IUseCommand {
  pushCommand: <Data>(type: CommandType, data: Data) => void
  replaceLastCommand: <Data>(type: CommandType, data: Data, save?: boolean) => void
  mergeLastCommand: (commands: ICommand[]) => void
  getLastCommand: () => ICommand | undefined
  undoCommand: (context: ISite, command: ICommand) => void
  undoN: (n: number) => void
  undoLastCommand: () => void
  redoCommand: () => void
  redoN: (n: number) => void
  clearAll: () => void
  clearPartial: (percent: number) => void
}

export const useCommand = (): IUseCommand => {
  const { site, siteStore } = useSiteSource()

  // Helper for pushing a command to separate siteStore.save
  const pushCommandHelper = <Data>(type: CommandType, data: Data, clearRedo = true) => {
    let [commandType, commandData] = [type, data]

    // Unwrap a group of 1 command to improve performance
    if (commandType === CommandType.Group) {
      const { commands } = commandData as ICommandGroupData
      if (commands.length === 1) {
        commandType = commands[0].type
        commandData = commands[0].data as Data
      }
    }

    const command = applyCommand(site.value, commandType, commandData)
    site.value.history.back.push(command)
    if (clearRedo) {
      site.value.history.forward = []
    }
  }

  // Applies a command and pushes it to the history stack
  const pushCommand = <Data>(type: CommandType, data: Data, clearRedo = true) => {
    pushCommandHelper(type, data, clearRedo)
    siteStore.value?.save(site.value)
  }

  // Applies a command and replaces the last command on the command stack
  const replaceLastCommand = <Data>(type: CommandType, data: Data, save?: boolean) => {
    const history = site.value.history
    const command = applyCommand(site.value, type, data)
    history.back[history.back.length - 1] = command
    if (save) {
      siteStore.value?.save(site.value)
    }
  }

  // Groups a list of commands with the previous command
  const mergeLastCommand = (commands: ICommand[]) => {
    mergeLastCommandHelper(site.value, commands)
    siteStore.value?.save(site.value)
  }

  const getLastCommand = (): ICommand | undefined => {
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

  const undoLastCommand = () => {
    undoLastCommandHelper()
    siteStore.value?.save(site.value)
  }

  const undoN = (n: number) => {
    for (let i = 0; i < n; i += 1) {
      undoLastCommand()
    }
    siteStore.value?.save(site.value)
  }

  // Redo the most recent un-done command
  const redoCommand = () => {
    const command = site.value.history.forward.pop()
    if (command) {
      pushCommand(command.type, command.data, false)
    }
  }

  // Redo the N most recent un-done commands
  const redoN = (n: number) => {
    for (let i = 0; i < n; i += 1) {
      const command = site.value.history.forward.pop()
      if (command) {
        pushCommandHelper(command.type, command.data, false)
      }
    }
    siteStore.value?.save(site.value)
  }

  // Clear all undo/redo history
  const clearAll = () => {
    site.value.history.back = []
    site.value.history.forward = []
    siteStore.value?.save(site.value)
  }

  // Clear a percentage of undo/redo history
  // `percent` is a decimal number between 0 and 1
  const clearPartial = (percent: number) => {
    const back = site.value.history.back
    const clearCount = Math.floor(back.length * percent)
    if (clearCount < back.length) {
      site.value.history.back = back.slice(0, -1 * clearCount)
      console.log(`Cleared ${clearCount} items from history`)
      siteStore.value?.save(site.value)
    }
  }

  return {
    pushCommand,
    replaceLastCommand,
    mergeLastCommand,
    getLastCommand,
    undoCommand,
    undoN,
    undoLastCommand,
    redoCommand,
    redoN,
    clearAll,
    clearPartial,
  }
}
