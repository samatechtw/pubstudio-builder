import { IUpdateUiData, UiAction } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applyOpenMixinMenu, undoOpenMixinMenu } from './open-mixin-menu'
import { applyCloseMixinMenu, undoCloseMixinMenu } from './close-mixin-menu'

export const applyUpdateUi = (site: ISite, data: IUpdateUiData) => {
  const applyFunctions = {
    [UiAction.OpenMixinMenu]: applyOpenMixinMenu,
    [UiAction.CloseMixinMenu]: applyCloseMixinMenu,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFunctions[data.action](site, data.params as any)
}

export const undoUpdateUi = (site: ISite, data: IUpdateUiData) => {
  const applyFunctions = {
    [UiAction.OpenMixinMenu]: undoOpenMixinMenu,
    [UiAction.CloseMixinMenu]: undoCloseMixinMenu,
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  applyFunctions[data.action](site, data.params as any)
}
