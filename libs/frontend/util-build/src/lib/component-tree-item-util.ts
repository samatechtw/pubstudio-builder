import { IComponent, IEditorContext } from '@pubstudio/shared/type-site'

export const expandComponentTreeItem = (
  editor: IEditorContext | undefined,
  component: IComponent,
) => {
  const treeItems = editor?.componentTreeExpandedItems
  let changed = false
  let currentComponent: IComponent | undefined = component
  if (treeItems) {
    // Expand component and ancestors
    while (currentComponent) {
      changed = changed || !treeItems[currentComponent.id]

      treeItems[currentComponent.id] = true
      currentComponent = currentComponent.parent
    }
    if (editor && changed) {
      editor.store?.saveEditor(editor)
    }
  }
}

export const collapseComponentTreeItem = (
  editor: IEditorContext | undefined,
  component: IComponent,
) => {
  const treeItems = editor?.componentTreeExpandedItems
  if (treeItems) {
    const prevExpanded = treeItems[component.id]
    treeItems[component.id] = false
    if (editor && prevExpanded) {
      editor.store?.saveEditor(editor)
    }
  }
}
