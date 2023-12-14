import { IEditorContext } from '@pubstudio/shared/type-site'

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
