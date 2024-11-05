import { IComponent, IPage, ISite } from '@pubstudio/shared/type-site'

export type ComponentIterFn = (component: IComponent) => void
export type ComponentFindFn = (component: IComponent) => boolean

export const iterateSite = (site: ISite, fn: ComponentIterFn) => {
  for (const page of Object.values(site.pages)) {
    iteratePage(page, fn)
  }
}

export const iteratePage = (page: IPage | undefined, fn: ComponentIterFn) => {
  if (page) {
    iterateComponent(page.root, fn)
  }
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
