import {
  createTranslationEditorView,
  IEditTranslation,
  useBuild,
} from '@pubstudio/frontend/feature-build'
import { showTranslations } from '@pubstudio/frontend/feature-editor'
import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'
import { INewTranslations } from '@pubstudio/shared/type-command-data'
import { ITranslations } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { EditorView } from 'prosemirror-view'
import { computed, ComputedRef, nextTick, Ref, ref, watch } from 'vue'
import { languageDict } from './supported-languages'

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
  selectActiveLanguage: (option: IMultiselectObj) => void
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
  const lang = ref()
  const editTranslation = ref<IEditTranslation | undefined>()
  const editorRef = ref()
  const saveTranslationError = ref()
  const confirmDeleteTranslation = ref()
  const confirmSaveTranslationKey = ref()
  let editorView: EditorView | undefined = undefined

  watch(
    () => editor.value?.translations,
    (show) => {
      if (show) {
        lang.value = getActiveI18n()
      }
    },
  )

  const makeOption = (key: string): IMultiselectObj => {
    return { label: languageDict[key], value: key }
  }

  const newLanguages = computed(() => {
    return Object.keys(languageDict)
      .filter((k) => k !== 'en' && !(k in site.value.context.i18n))
      .map(makeOption)
  })

  const currentLanguages = computed(() => {
    let langs = Object.keys(site.value.context.i18n).map(makeOption)
    if (!site.value.context.i18n['en']) {
      langs = [makeOption('en'), ...langs]
    }
    return langs
  })

  const confirmAddLanguage = () => {
    if (newLanguage.value && !site.value.context.i18n[newLanguage.value]) {
      setTranslations({ code: newLanguage.value, translations: {} })
    }
    newLanguage.value = undefined
    addLanguage.value = false
  }

  // TODO -- should this be a command? We'll also need to control it somehow from the
  // user/viewer perspective, maybe cached via localstorage
  const selectActiveLanguage = (option: IMultiselectObj) => {
    site.value.context.activeI18n = option.value as string
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
    const text = isNew ? '' : activeTranslations.value[key]
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

  const getActiveI18n = (): string => {
    return site.value.context.activeI18n ?? 'en'
  }

  const confirmSaveTranslation = () => {
    const edit = editTranslation.value
    if (!edit) {
      return
    }
    const updates: INewTranslations = { [edit.key]: edit.text }

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
