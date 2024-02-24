import {
  scrollToComponentTreeItem,
  setSelectedComponent,
} from '@pubstudio/frontend/data-access-command'
import { IComponent, ISite } from '@pubstudio/shared/type-site'

export const selectComponent = (site: ISite, component: IComponent) => {
  setSelectedComponent(site, component)

  // Scroll to the corresponding tree item if component tree is visible
  if (site.editor?.showComponentTree) {
    scrollToComponentTreeItem(component)
  }
}

export const selectPreviousComponent = (site: ISite, component: IComponent) => {
  const previousSibling = findPreviousSibling(component)
  if (previousSibling) {
    const deepestChild = findDeepestChild(previousSibling)
    selectComponent(site, deepestChild)
  } else if (component.parent) {
    selectComponent(site, component.parent)
  }
}

export const selectNextComponent = (
  site: ISite,
  component: IComponent,
  checkChildren: boolean,
) => {
  if (checkChildren && component.children?.length) {
    const selected = component.children[0]
    selectComponent(site, selected)
    return
  }

  // Select the next sibling of current component
  const nextSibling = findNextSibling(component)
  if (nextSibling) {
    selectComponent(site, nextSibling)
    return
  }

  // Select the next sibling of parent
  if (component.parent) {
    selectNextComponent(site, component.parent, false)
  }
}

export const findPreviousSibling = (component: IComponent): IComponent | undefined => {
  if (component.parent) {
    const index = component.parent.children?.indexOf(component)
    if (index === undefined || index < 0) {
      throw new Error(`No child ${component.id} in parent:  ${component.parent.id}`)
    }
    return component.parent.children?.[index - 1]
  }
  return undefined
}

export const findNextSibling = (component: IComponent): IComponent | undefined => {
  if (component.parent?.children?.length) {
    const index = component.parent.children.indexOf(component)
    if (index < 0) {
      throw new Error(`Not child ${component.id} in parent: ${component.parent.id}`)
    }
    return component.parent.children[index + 1]
  }
  return undefined
}

// Recursively find the deepest child of given component, including the given component itself.
export const findDeepestChild = (component: IComponent): IComponent => {
  let cursor: IComponent | undefined = component

  while (cursor?.children?.length) {
    cursor = findDeepestChild(cursor.children.at(-1) as IComponent)
  }

  return cursor
}
