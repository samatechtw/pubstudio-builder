import { iterateComponent } from '@pubstudio/frontend/util-render'
import { IComponent, IEditorContext } from '@pubstudio/shared/type-site'

const getComponentIds = (
  component: IComponent,
  children: boolean,
  ancestors: boolean,
): string[] => {
  let componentIds: string[] = []
  if (children) {
    iterateComponent(component, (cmp) => {
      componentIds.push(cmp.id)
    })
  } else {
    componentIds = [component.id]
  }
  if (ancestors) {
    let currentComponent: IComponent | undefined = component.parent
    while (currentComponent) {
      componentIds.push(currentComponent.id)
      currentComponent = currentComponent.parent
    }
  }
  return componentIds
}

export const expandComponentTreeItem = (
  editor: IEditorContext | undefined,
  component: IComponent,
  children: boolean,
) => {
  const treeItems = editor?.componentTreeExpandedItems
  let changed = false
  if (treeItems) {
    const componentIds = getComponentIds(component, children, true)
    for (const id of componentIds) {
      changed = changed || !treeItems[id]
      treeItems[id] = true
    }
    if (editor && changed) {
      editor.store?.saveEditor(editor)
    }
  }
}

export const collapseComponentTreeItem = (
  editor: IEditorContext | undefined,
  component: IComponent,
  children: boolean,
) => {
  const treeItems = editor?.componentTreeExpandedItems
  if (treeItems) {
    let prevExpanded = false
    const componentIds = getComponentIds(component, children, false)
    for (const id of componentIds) {
      prevExpanded = prevExpanded || !!treeItems[id]
      treeItems[id] = false
    }
    if (editor && prevExpanded) {
      editor.store?.saveEditor(editor)
    }
  }
}
