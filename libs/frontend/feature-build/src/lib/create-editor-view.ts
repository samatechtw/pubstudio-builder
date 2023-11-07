import {
  editorStateToHtml,
  IProsemirrorSetupOptions,
  prosemirrorSetup,
} from '@pubstudio/frontend/util-edit-text'
import { EditorView } from 'prosemirror-view'
import { Ref } from 'vue'
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
        translation.value.text = content
        setTranslations(
          translation.value.code,
          { [translation.value.originalKey ?? '']: content },
          !first,
        )
      }
      first = false
      view.updateState(newState)
    },
  })
  return view
}
