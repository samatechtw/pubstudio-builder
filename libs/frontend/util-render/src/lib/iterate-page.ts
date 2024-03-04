import { IComponent, IPage } from '@pubstudio/shared/type-site'

type ComponentIterFn = (component: IComponent) => void

export const iteratePage = (page: IPage, fn: ComponentIterFn) => {
  // Tree iteration
  const stack = [page.root]
  while (stack.length > 0) {
    const cmp = stack.pop()
    fn(cmp as IComponent)
    if (cmp?.children) {
      stack.push(...cmp.children)
    }
  }
}
