import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { ISite } from '@pubstudio/shared/type-site'
import { applyCommand } from './apply-command'
import { getLastCommandHelper } from './command-helpers'
import { optimizeCommandGroup } from './optimize-command-group'
import { undoCommand } from './undo-command'

// Helper for pushing a command to separate siteStore.save
const pushCommandHelper = (site: ISite, command: ICommand, clearRedo = true) => {
  const cmd = optimizeCommandGroup(command)
  if (cmd) {
    applyCommand(site, cmd)
    site.history.back.push(cmd)
    if (clearRedo) {
      site.history.forward = []
    }
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

// Clear a percentage of undo/redo history
// `percent` is a decimal number between 0 and 1
export const clearPartial = (site: ISite, percent: number) => {
  const back = site.history.back
  const clearCount = Math.floor(back.length * percent)
  if (clearCount < back.length) {
    site.history.back = back.slice(0, -1 * clearCount)
    console.log(`Cleared ${clearCount} items from history`)
    site.editor?.store?.save(site)
  }
}
