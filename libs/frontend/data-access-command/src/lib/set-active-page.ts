import { BuildSubmenu, IEditorContext } from '@pubstudio/shared/type-site'

export const setActivePage = (
  editor: IEditorContext | undefined,
  pageRoute: string,
  skipSave?: boolean,
) => {
  if (editor) {
    // Switching pages leaves the component edit screen; its arena is not a page
    editor.editingComponentId = undefined
    editor.active = pageRoute
    if (editor.buildSubmenu === BuildSubmenu.Page) {
      editor.buildSubmenu = undefined
    }
    if (!skipSave) {
      editor.store?.saveEditor(editor)
    }
  }
}
