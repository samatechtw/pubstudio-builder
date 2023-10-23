import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IRemoveComponentMixinData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { addComponentMixin, removeComponentMixin } from './component-mixin-common'

export interface RemoveComponentMixin extends ICommand<IRemoveComponentMixinData> {
  type: CommandType.RemoveComponentMixin
}

export const applyRemoveComponentMixin = (
  site: ISite,
  data: IRemoveComponentMixinData,
) => {
  removeComponentMixin(site.context, data)
}

export const undoRemoveComponentMixin = (
  site: ISite,
  data: IRemoveComponentMixinData,
) => {
  addComponentMixin(site.context, data)
}
