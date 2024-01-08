import { editingMixinData } from '@pubstudio/frontend/util-command'
import { IEditorContext } from '@pubstudio/shared/type-site'

export const hotkeysDisabled = (e: KeyboardEvent, editor: IEditorContext | undefined) => {
  return (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    editor?.editBehavior ||
    editor?.translations ||
    !!editingMixinData.value ||
    (e.target instanceof HTMLElement && e.target.classList.contains('ProseMirror'))
  )
}
