import { UiAction } from '@pubstudio/shared/type-command-data'
import { useBuild } from '../use-build'

export interface IUseMixinMenuUi {
  openMixinMenu: (mixinId: string, fromComponent: boolean) => void
  closeMixinMenu: () => void
}

export const useMixinMenuUi = (): IUseMixinMenuUi => {
  const { editor, updateUi } = useBuild()

  const openMixinMenu = (mixinId: string, fromComponent: boolean) => {
    updateUi(UiAction.OpenMixinMenu, {
      mixinId,
      originComponentId: fromComponent ? editor.value?.selectedComponent?.id : undefined,
    })
  }

  const closeMixinMenu = () => {
    const { mixinId } = editor.value?.editingMixinData ?? {}
    if (mixinId) {
      updateUi(UiAction.CloseMixinMenu, {
        mixinId,
        originComponentId: editor.value?.editingMixinData?.originComponentId,
      })
    }
  }

  return {
    openMixinMenu,
    closeMixinMenu,
  }
}
