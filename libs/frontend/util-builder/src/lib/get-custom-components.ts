import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'

// Definitions in registry order, for the custom component menu
export const getCustomComponents = (context: ISiteContext): IComponent[] =>
  Array.from(context.customComponentIds)
    .map((id) => resolveComponent(context, id))
    .filter((cmp) => !!cmp) as IComponent[]
