import { defaultContext } from '@pubstudio/frontend/util-ids'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'
import { builtinComponents } from './components/builtin-components'

export const resolveComponent = (
  context: ISiteContext,
  componentId: string | undefined,
): IComponent | undefined => {
  if (!componentId) {
    return undefined
  }

  if (componentId.startsWith(context.namespace)) {
    return context.components[componentId]
  } else if (componentId.startsWith(defaultContext.namespace)) {
    return builtinComponents[componentId]
  } else {
    // TODO -- resolve external namespaces
  }
  return undefined
}
