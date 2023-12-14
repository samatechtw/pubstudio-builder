import {
  editorStateToHtml,
  IProsemirrorSetupOptions,
  prosemirrorSetup,
  schemaText,
} from '@pubstudio/frontend/util-edit-text'
import { EditorView } from 'prosemirror-view'
import { ref, Ref } from 'vue'
import { useBuild } from './use-build'
import { whitespacePasteFixPlugin } from './whitespace-paste-fix-plugin'

// Use to detect updates in the ProseMirror component edit view
export const editViewTxCount = ref(0)

export function createComponentEditorView(
  options: Omit<IProsemirrorSetupOptions, 'schema'>,
  container: HTMLElement,
): EditorView | undefined {
  const { editSelectedComponent } = useBuild()
  if (!container) {
    return undefined
  }
  const plugins = [...(options.plugins ?? []), whitespacePasteFixPlugin(schemaText)]
  const state = prosemirrorSetup({
    ...options,
    plugins,
    schema: schemaText,
  })

  const view = new EditorView(container, {
    state,
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction)
      const content = editorStateToHtml(schemaText, newState)
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

export interface ITranslationEditorViewOptions
  extends Omit<IProsemirrorSetupOptions, 'schema'> {
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
  const schema = schemaText
  const { translation } = options
  const state = prosemirrorSetup({ ...options, schema })
  let first = true

  const view = new EditorView(container, {
    state,
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction)
      const content = editorStateToHtml(schema, newState)
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
