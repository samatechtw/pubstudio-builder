import {
  editorStateToHtml,
  IProsemirrorSetupOptions,
  prosemirrorSetup,
} from '@pubstudio/frontend/util-edit-text'
import { EditorView } from 'prosemirror-view'
import { ref, Ref } from 'vue'
import { useBuild } from './use-build'

// Use to detect updates in the ProseMirror component edit view
export const editViewTxCount = ref(0)

export function createComponentEditorView(
  options: IProsemirrorSetupOptions,
  container: HTMLElement,
): EditorView | undefined {
  const { editSelectedComponent } = useBuild()
  if (!container) {
    return undefined
  }
  const state = prosemirrorSetup(options)

  const view = new EditorView(container, {
    state,
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction)
      const content = editorStateToHtml(newState)
      editSelectedComponent({ content })
      view.updateState(newState)
      editViewTxCount.value += 1
    },
  })
  return view
}

export interface IEditTranslation {
  code: string
  originalKey: string | undefined
  key: string
  text: string
  isNew: boolean
}

export interface ITranslationEditorViewOptions extends IProsemirrorSetupOptions {
  translation: Ref<IEditTranslation | undefined>
}

// For editing standalone i18n values
export function createTranslationEditorView(
  options: ITranslationEditorViewOptions,
  container: HTMLElement,
): EditorView | undefined {
  const { setTranslations } = useBuild()
  if (!container) {
    return undefined
  }
  const { translation } = options
  const state = prosemirrorSetup(options)
  let first = true

  const view = new EditorView(container, {
    state,
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction)
      const content = editorStateToHtml(newState)
      if (translation.value) {
        translation.value.text = content || ''
        setTranslations({
          code: translation.value.code,
          translations: { [translation.value.originalKey ?? '']: content },
          replace: !first,
        })
      }
      first = false
      view.updateState(newState)
    },
  })
  return view
}
