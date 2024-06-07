import { BuildSubmenu, IEditorContext } from '@pubstudio/shared/type-site'

export const setActivePage = (
  editor: IEditorContext | undefined,
  pageRoute: string,
  skipSave?: boolean,
) => {
  if (editor) {
    editor.active = pageRoute
    if (editor.buildSubmenu === BuildSubmenu.Page) {
      editor.buildSubmenu = undefined
    }
    if (!skipSave) {
      editor.store?.saveEditor(editor)
    }
  }
}
