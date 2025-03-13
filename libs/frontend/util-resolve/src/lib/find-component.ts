import { IComponent } from '@pubstudio/shared/type-site'

export type ComponentFindFn = (component: IComponent) => boolean

export const findComponent = (
  component: IComponent | undefined,
  fn: ComponentFindFn,
): IComponent | undefined => {
  const stack = [component]
  while (stack.length > 0) {
    const cmp = stack.pop()
    if (fn(cmp as IComponent)) {
      return cmp
    }
    if (cmp?.children) {
      stack.push(...cmp.children)
    }
  }
  return undefined
}
