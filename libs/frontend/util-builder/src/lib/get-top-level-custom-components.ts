import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'

// Get custom components that were explicitly added (not including children)
// for display in the custom component menu
export const getTopLevelCustomComponents = (context: ISiteContext) => {
  const ids = context.customComponentIds.values() ?? []
  return Array.from(ids)
    .map((id) => resolveComponent(context, id))
    .filter((cmp) => !!cmp) as IComponent[]
}
