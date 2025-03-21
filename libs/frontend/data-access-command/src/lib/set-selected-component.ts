import {
  EditorMode,
  IComponent,
  IEditorContext,
  ISite,
} from '@pubstudio/shared/type-site'
import { expandComponentTreeItem } from './component-tree-item-util'
import { editStylesCancelEdit } from './edit-styles-data'
import { getComponentTreeItemId } from './editor-helpers'
import { scrollToComponent } from './scroll-to-component'

export const clearComponentTabState = (editor: IEditorContext | undefined) => {
  if (editor) {
    editor.componentTab.state = undefined
    editor.componentTab.editEvent = undefined
    editor.componentTab.editInput = undefined
    editor.componentTab.editInputValue = undefined
    editor.componentTab.editInfo = undefined
    editor.store?.saveEditor(editor)
  }
}

export interface ISetSelectedComponentOptions {
  /**
   * @default true
   */
  expandTree?: boolean
  /**
   * @default true
   */
  scrollToComponent?: boolean
}

export const setSelectedComponent = (
  site: ISite,
  component: IComponent | undefined,
  options?: ISetSelectedComponentOptions,
) => {
  const { editor } = site
  if (editor) {
    // Remember old state to see if we should save to local storage
    const prevComponent = editor.selectedComponent
    const prevMode = editor.mode

    editor.selectedComponent = component
    const isSelectMode = editor.mode === EditorMode.SelectedComponent
    const { expandTree = true, scrollToComponent: shouldScrollToComponent = true } =
      options ?? {}
    if (component) {
      if (!isSelectMode) {
        editor.mode = EditorMode.SelectedComponent
      }
      if (expandTree) {
        expandComponentTreeItem(editor, component)
      }
      editor.componentTreeRenameData.itemId = getComponentTreeItemId(component)
      if (shouldScrollToComponent) {
        scrollToComponent(site, component)
      }
    } else if (isSelectMode) {
      editor.mode = EditorMode.None
    }
    // Save editor state to local storage if anything changed
    if (editor.mode !== prevMode || component !== prevComponent) {
      editStylesCancelEdit(site)
      clearComponentTabState(editor)
    }
  }
}
