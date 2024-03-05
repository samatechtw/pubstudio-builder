import { IReusableComponent, ISiteContext } from '@pubstudio/shared/type-site'

export const resolveReusableComponent = (
  context: ISiteContext,
  reusableComponentId: string | undefined,
): IReusableComponent | undefined => {
  if (!reusableComponentId) {
    return undefined
  }

  if (reusableComponentId.startsWith(context.namespace)) {
    return context.reusableComponents[reusableComponentId]
  } else {
    // TODO -- resolve external namespaces
  }
  return undefined
}
