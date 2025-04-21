import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IUpdateUiData,
  IUpdateUiParams,
  UiAction,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

const updateUi = <Action extends UiAction>(
  site: ISite,
  action: Action,
  params: IUpdateUiParams[Action],
) => {
  const data: IUpdateUiData<Action> = {
    action,
    params,
  }
  pushCommand(site, CommandType.UpdateUi, data)
}

export const openMixinMenu = (site: ISite, mixinId: string, fromComponent: boolean) => {
  updateUi(site, UiAction.OpenMixinMenu, {
    mixinId,
    originComponentId: fromComponent ? site.editor?.selectedComponent?.id : undefined,
  })
}

export const closeMixinMenu = (site: ISite) => {
  const { mixinId } = site.editor?.editingMixinData ?? {}
  if (mixinId) {
    updateUi(site, UiAction.CloseMixinMenu, {
      mixinId,
      originComponentId: site.editor?.editingMixinData?.originComponentId,
    })
  }
}
