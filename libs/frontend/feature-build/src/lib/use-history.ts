import { redoCommand, undoLastCommand } from '@pubstudio/frontend/feature-command'
import { componentStylesCancelEdit } from '@pubstudio/frontend/util-build'
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
    undoLastCommand()
    componentStylesCancelEdit()
  }

  const redo = (uiAlert = false) => {
    if (!activePage.value) {
      return
    }
    if (uiAlert) {
      commandAlert.value = CommandType.Redo
    }
    redoCommand()
  }

  return {
    canRedo,
    canUndo,
    undo,
    redo,
  }
}
