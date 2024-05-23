import { IComponent, IPage } from '@pubstudio/shared/type-site'

export type ComponentIterFn = (component: IComponent) => void
export type ComponentFindFn = (component: IComponent) => boolean

export const iteratePage = (page: IPage, fn: ComponentIterFn) => {
  iterateComponent(page.root, fn)
}

export const iterateComponent = (
  component: IComponent[] | IComponent | undefined,
  fn: ComponentIterFn,
) => {
  let stack: IComponent[] = []
  if (Array.isArray(component)) {
    stack = [...component]
  } else if (component) {
    stack = [component]
  }
  while (stack.length > 0) {
    const cmp = stack.pop()
    fn(cmp as IComponent)
    if (cmp?.children) {
      stack.push(...cmp.children)
    }
  }
}

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
