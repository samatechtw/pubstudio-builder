import { IEditorContext } from '@pubstudio/shared/type-site'
import { TextSelection } from 'prosemirror-state'

export const prosemirrorEditing = (editor: IEditorContext | undefined): boolean => {
  const selection = editor?.editView?.state.selection as TextSelection
  return selection?.empty === false || !!selection?.$cursor
}
