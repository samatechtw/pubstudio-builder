import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { ISiteContext } from '@pubstudio/shared/type-site'

export interface IComponentMixinData {
  componentId: string
  mixinId: string
}

export const addComponentMixin = (context: ISiteContext, data: IComponentMixinData) => {
  const { componentId, mixinId } = data
  const component = resolveComponent(context, componentId)
  const style = component?.style
  if (style) {
    if (!style.mixins?.includes(mixinId)) {
      if (style.mixins) {
        style.mixins.push(mixinId)
      } else {
        style.mixins = [mixinId]
      }
    }
  }
}

export const removeComponentMixin = (
  context: ISiteContext,
  data: IComponentMixinData,
) => {
  const { componentId, mixinId } = data
  const component = resolveComponent(context, componentId)
  if (component && component.style.mixins) {
    component.style.mixins = component.style.mixins.filter((id) => id !== mixinId)
    // Clean up the Site JSON if mixins are empty
    if (component.style.mixins.length === 0) {
      component.style.mixins = undefined
    }
  }
}
