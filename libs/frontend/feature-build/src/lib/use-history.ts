import { redoCommand, undoLastCommand } from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
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
  const { site } = useSiteSource()
  const { commandAlert } = useBuild()
  const canRedo = computed(() => !!site.value.history.forward.length)
  const canUndo = computed(() => !!site.value.history.back.length)

  const undo = (uiAlert = false) => {
    if (uiAlert) {
      commandAlert.value = CommandType.Undo
    }
    undoLastCommand(site.value)
  }

  const redo = (uiAlert = false) => {
    if (uiAlert) {
      commandAlert.value = CommandType.Redo
    }
    redoCommand(site.value)
  }

  return {
    canRedo,
    canUndo,
    undo,
    redo,
  }
}
