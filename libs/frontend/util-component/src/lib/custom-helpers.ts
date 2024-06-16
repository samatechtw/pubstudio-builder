import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'

const isCustom = (context: ISiteContext, component: IComponent | undefined) => {
  return (
    !!component &&
    (!!component.customSourceId || context.customComponentIds.has(component.id))
  )
}

export const canBecomeCustom = (
  context: ISiteContext,
  componentId: string | undefined,
): boolean => {
  let parent = resolveComponent(context, componentId)
  if (!parent || isCustom(context, parent)) {
    return false
  }
  while (parent) {
    if (isCustom(context, parent)) return false
    parent = parent.parent
  }
  return true
}
