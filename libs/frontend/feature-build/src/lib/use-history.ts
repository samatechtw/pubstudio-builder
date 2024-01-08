import {
  editStylesCancelEdit,
  getLastCommand,
  redoCommand,
  undoLastCommand,
} from '@pubstudio/frontend/util-command'
import { CommandType } from '@pubstudio/shared/type-command'
import { computed, ComputedRef } from 'vue'
import { useBuild } from './use-build'

export interface IUseHistory {
  canRedo: ComputedRef<boolean>
  canUndo: ComputedRef<boolean>
  redo: (uiAlert?: boolean) => void
  undo: (uiAlert?: boolean) => void
}

export const useHistory = (): IUseHistory => {
  const { site, activePage, commandAlert } = useBuild()
  const canRedo = computed(() => !!site.value.history.forward.length)
  const canUndo = computed(() => !!site.value.history.back.length)

  const undo = (uiAlert = false) => {
    if (!activePage.value) {
      return
    }
    if (uiAlert) {
      commandAlert.value = CommandType.Undo
    }
    const lastCommand = getLastCommand(site.value)
    // Clear style edit data
    if (
      lastCommand &&
      ![CommandType.EditStyleMixin, CommandType.SetMixinEntry].includes(lastCommand.type)
    ) {
      editStylesCancelEdit(site.value)
    }

    undoLastCommand(site.value)
  }

  const redo = (uiAlert = false) => {
    if (!activePage.value) {
      return
    }
    if (uiAlert) {
      commandAlert.value = CommandType.Redo
    }
    redoCommand(site.value)
    editStylesCancelEdit(site.value)
  }

  return {
    canRedo,
    canUndo,
    undo,
    redo,
  }
}
