import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  editorStateToHtml,
  IProsemirrorSetupOptions,
  parseLinksDuringPaste,
  prosemirrorSetup,
  schemaText,
  textToLinkKeymap,
} from '@pubstudio/frontend/util-edit-text'
import { keymap } from 'prosemirror-keymap'
import { EditorView } from 'prosemirror-view'
import { ref, Ref } from 'vue'
import { setTranslations } from './command-wrap/translations'
import { useBuild } from './use-build'

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
  const plugins = [
    ...(options.plugins ?? []),
    keymap(textToLinkKeymap(schemaText)),
    parseLinksDuringPaste(schemaText),
  ]
  const state = prosemirrorSetup({
    ...options,
    plugins,
    schema: schemaText,
    // Overwrite Enter key so that `textToLinkKeymap` works properly.
    overwriteBaseKeys: ['Enter'],
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
  const { site } = useSiteSource()
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
        setTranslations(site.value, {
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
