import { IComponent, ISiteContext } from '@pubstudio/shared/type-site'

export const resolveComponent = (
  context: ISiteContext,
  componentId: string | undefined,
): IComponent | undefined => {
  if (!componentId) {
    return undefined
  }
  return context.components[componentId]
}
