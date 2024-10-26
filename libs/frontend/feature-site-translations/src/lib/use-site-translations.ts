import {
  setActiveLanguage,
  showTranslations,
} from '@pubstudio/frontend/data-access-command'
import {
  createTranslationEditorView,
  IEditTranslation,
  useBuild,
} from '@pubstudio/frontend/feature-build'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'
import {
  DEFAULT_LANGUAGE,
  getCurrentLanguages,
  languageDict,
  makeLanguageOption,
} from '@pubstudio/frontend/util-site-translations'
import { INewTranslations } from '@pubstudio/shared/type-command-data'
import { ITranslations } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { EditorView } from 'prosemirror-view'
import { computed, ComputedRef, nextTick, Ref, ref, watch } from 'vue'

export interface ISiteTranslationsFeature {
  editTranslation: Ref<IEditTranslation | undefined>
  editorRef: Ref<HTMLElement | undefined>
  saveTranslationError: Ref<string | undefined>
  addLanguage: Ref<boolean>
  newLanguage: Ref<string | undefined>
  newLanguages: ComputedRef<IMultiselectObj[]>
  currentLanguages: ComputedRef<IMultiselectObj[]>
  activeKeys: ComputedRef<string[]>
  activeTranslations: ComputedRef<ITranslations>
  confirmDeleteTranslation: Ref<string | undefined>
  confirmSaveTranslationKey: Ref<string | undefined>
  confirmAddLanguage: () => void
  selectActiveLanguage: (option: IMultiselectObj | undefined) => void
  showEditTranslation: (key?: string) => Promise<void>
  saveTranslation: () => void
  deleteTranslation: () => void
  closeTranslations: () => void
  confirmSaveTranslation: () => void
  cancelTranslation: () => void
}

export const useSiteTranslations = (): ISiteTranslationsFeature => {
  const { t } = useI18n()
  const { editor, site, setTranslations } = useBuild()

  const addLanguage = ref(false)
  const newLanguage = ref()
  const editTranslation = ref<IEditTranslation | undefined>()
  const editorRef = ref()
  const saveTranslationError = ref()
  const confirmDeleteTranslation = ref()
  const confirmSaveTranslationKey = ref()
  let editorView: EditorView | undefined = undefined

  watch(
    () => editor.value?.translations,
    (show) => {
      const { i18n } = site.value.context
      const editorI18n = editor.value?.editorI18n
      if (show && editorI18n && !(editorI18n in i18n)) {
        // Set the active language back to default if it does not exist
        // in the editor context. This is most likely to occur when the
        // language is removed using the undo command.
        const defaultLanguage = currentLanguages.value.find(
          (language) => language.value === DEFAULT_LANGUAGE,
        )
        if (defaultLanguage) {
          selectActiveLanguage(defaultLanguage)
        }
      }
    },
  )

  const newLanguages = computed(() => {
    return Object.keys(languageDict)
      .filter((k) => k !== DEFAULT_LANGUAGE && !(k in site.value.context.i18n))
      .map(makeLanguageOption)
  })

  const currentLanguages = computed(() => {
    return getCurrentLanguages(site.value.context)
  })

  const confirmAddLanguage = () => {
    if (newLanguage.value && !site.value.context.i18n[newLanguage.value]) {
      setTranslations({ code: newLanguage.value, translations: {} })
      setActiveLanguage(site.value, newLanguage.value)
    }
    newLanguage.value = undefined
    addLanguage.value = false
  }

  const selectActiveLanguage = (option: IMultiselectObj | undefined) => {
    const lang = option?.value as string
    setActiveLanguage(site.value, lang)
  }

  const activeTranslations = computed(() => {
    return site.value.context.i18n[getActiveI18n()] ?? {}
  })

  const activeKeys = computed(() => {
    return Object.keys(activeTranslations.value)
  })

  const showEditTranslation = async (editKey?: string) => {
    const isNew = editKey === undefined
    const key = editKey ?? ''
    const text = isNew ? '' : appendPmWrapper(activeTranslations.value[key])
    editTranslation.value = {
      code: getActiveI18n(),
      isNew,
      originalKey: editKey,
      key,
      text,
    }
    await nextTick()
    editorView = createTranslationEditorView(
      { content: text, translation: editTranslation },
      editorRef.value,
    )
  }

  // Wraps each line of content in a `<div class="pm-p">...</div>` wrapper
  // so that text can be correctly displayed in a ProseMirror editor.
  const appendPmWrapper = (text: string) => {
    return text
      .split('\n')
      .map((line) => `<div class="pm-p">${line}</div>`)
      .join('')
  }

  const getActiveI18n = (): string => {
    return editor.value?.editorI18n ?? DEFAULT_LANGUAGE
  }

  const confirmSaveTranslation = () => {
    const edit = editTranslation.value
    if (!edit) {
      return
    }
    const updates: INewTranslations = { [edit.key]: stripPmWrappers() }

    if (edit.key !== edit.originalKey) {
      updates[edit.originalKey ?? ''] = undefined
    }
    setTranslations({
      code: getActiveI18n(),
      translations: updates,
      replace: true,
      forceSave: true,
    })
    editTranslation.value = undefined
    editorView?.destroy()
    editorView = undefined
    confirmSaveTranslationKey.value = undefined
    saveTranslationError.value = undefined
  }

  // The content from ProseMirror editor is wrapped in `<div class="pm-p">...<div>` for each line.
  // This function removes those wrappers and use `\n` as the new line character.
  const stripPmWrappers = () => {
    const div = document.createElement('div')
    div.innerHTML = editTranslation.value?.text ?? ''

    let strippedContent = ''
    div.childNodes.forEach((childNode, index) => {
      if (index > 0) {
        strippedContent += '\n'
      }
      strippedContent += childNode.textContent
    })

    return strippedContent
  }

  const saveTranslation = () => {
    const edit = editTranslation.value
    if (edit) {
      if (!edit.key) {
        saveTranslationError.value = t('errors.i18n_key')
      } else if (edit.key !== edit.originalKey && !!activeTranslations.value[edit.key]) {
        confirmSaveTranslationKey.value = edit.key
      } else {
        confirmSaveTranslation()
      }
    }
  }

  const closeTranslations = () => {
    const edit = editTranslation.value
    if (edit && !edit.key) {
      saveTranslationError.value = t('errors.i18n_key')
    } else {
      saveTranslation()
      showTranslations(editor.value, false)
    }
  }

  const deleteTranslation = () => {
    const key = confirmDeleteTranslation.value
    if (key !== undefined) {
      const code = getActiveI18n()
      setTranslations({ code, translations: { [key]: undefined }, replace: false })
      confirmDeleteTranslation.value = undefined
    }
  }

  const cancelTranslation = () => {
    confirmSaveTranslation()
  }

  return {
    editTranslation,
    editorRef,
    saveTranslationError,
    addLanguage,
    newLanguage,
    newLanguages,
    currentLanguages,
    activeTranslations,
    activeKeys,
    confirmDeleteTranslation,
    confirmSaveTranslationKey,
    confirmAddLanguage,
    selectActiveLanguage,
    showEditTranslation,
    saveTranslation,
    closeTranslations,
    deleteTranslation,
    confirmSaveTranslation,
    cancelTranslation,
  }
}
