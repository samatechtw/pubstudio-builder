import {
  editorStateToHtml,
  IProsemirrorSetupOptions,
  prosemirrorSetup,
} from '@pubstudio/frontend/util-edit-text'
import { EditorView } from 'prosemirror-view'
import { useBuild } from './use-build'

export function createComponentEditorView(
  options: IProsemirrorSetupOptions,
  container: HTMLElement,
): EditorView | undefined {
  const { editComponent } = useBuild()
  if (!container) {
    return undefined
  }
  const state = prosemirrorSetup(options)

  const view = new EditorView(container, {
    state,
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction)
      const content = editorStateToHtml(newState)
      editComponent({ content })
      view.updateState(newState)
    },
  })
  return view
}
