import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddComponentMixinData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { addComponentMixin, removeComponentMixin } from './component-mixin-common'

export interface AddComponentMixin extends ICommand<IAddComponentMixinData> {
  type: CommandType.AddComponentMixin
}

export const applyAddComponentMixin = (site: ISite, data: IAddComponentMixinData) => {
  addComponentMixin(site.context, data)
}

export const undoAddComponentMixin = (site: ISite, data: IAddComponentMixinData) => {
  removeComponentMixin(site.context, data)
}
