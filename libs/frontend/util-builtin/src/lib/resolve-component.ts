import { defaultContext } from '@pubstudio/frontend/util-ids'
import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'
import { builtinComponents } from './components/builtin-components'
import { parseId } from './resolve-util'

export const resolveComponent = (
  context: ISiteContext,
  componentId: string | undefined,
): IComponent | undefined => {
  if (!componentId) {
    return undefined
  }
  const { namespace } = parseId(componentId)

  if (namespace === context.namespace) {
    return context.components[componentId]
  } else if (namespace === defaultContext.namespace) {
    return builtinComponents[componentId]
  } else {
    // TODO -- resolve external namespaces
  }
  return undefined
}
