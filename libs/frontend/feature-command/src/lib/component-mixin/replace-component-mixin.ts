import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IReplaceComponentMixinData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { addComponentMixin, removeComponentMixin } from './component-mixin-common'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { setSelectedComponent } from '@pubstudio/frontend/feature-editor'

export interface ReplaceComponentMixin extends ICommand<IReplaceComponentMixinData> {
  type: CommandType.ReplaceComponentMixin
}

export const applyReplaceComponentMixin = (
  site: ISite,
  data: IReplaceComponentMixinData,
) => {
  const context = site.context
  const { componentId, oldMixinId, newMixinId } = data
  removeComponentMixin(context, { componentId, mixinId: oldMixinId })
  addComponentMixin(context, { componentId, mixinId: newMixinId })
  // Select edited component for redo
  const component = resolveComponent(site.context, data.componentId)
  setSelectedComponent(site, component)
}

export const undoReplaceComponentMixin = (
  site: ISite,
  data: IReplaceComponentMixinData,
) => {
  const context = site.context
  const { componentId, oldMixinId, newMixinId } = data
  removeComponentMixin(context, { componentId, mixinId: newMixinId })
  addComponentMixin(context, { componentId, mixinId: oldMixinId })
  // Select edited component for undo
  const component = resolveComponent(site.context, data.componentId)
  setSelectedComponent(site, component)
}
