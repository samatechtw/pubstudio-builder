import { IThemeFont, ThemeFontSource } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, reactive, Ref, ref, UnwrapNestedRefs } from 'vue'
import { useBuild } from './use-build'

export interface IUseThemeMenuFontFeature {
  editing: Ref<boolean>
  editingFont: UnwrapNestedRefs<IThemeFont>
  // All Google Fonts selected at runtime.
  selectedGoogleFonts: Ref<Set<string>>
  fontError: Ref<string | undefined>
  fonts: ComputedRef<IThemeFont[]>
  clearEditingState: () => void
  newFont: () => void
  setEditingFont: (font: IThemeFont) => void
  saveFont: () => void
}

const emptyFont = (): IThemeFont => ({
  source: ThemeFontSource.Native,
  name: '',
  fallback: undefined,
})

const editing = ref(false)
const editingFont = reactive<IThemeFont>(emptyFont())
const selectedGoogleFonts = ref(new Set<string>())
const editingFontSource = reactive<IThemeFont>(emptyFont())
const fontError = ref<string | undefined>()

export const resetThemeMenu = () => {
  editing.value = false
  Object.assign(editingFont, emptyFont())
  Object.assign(editingFontSource, emptyFont())
  fontError.value = undefined
}

export const useThemeMenuFonts = (): IUseThemeMenuFontFeature => {
  const { t } = useI18n()
  const { site, addThemeFont, editThemeFont } = useBuild()

  const fonts = computed(() => {
    return Object.values(site.value.context.theme.fonts)
  })

  const clearEditingState = () => {
    Object.assign(editingFont, emptyFont())
    Object.assign(editingFontSource, emptyFont())
    fontError.value = undefined
    editing.value = false
  }

  const newFont = () => {
    Object.assign(editingFont, emptyFont())
    Object.assign(editingFontSource, emptyFont())
    editing.value = true
    console.log('NEWF', editing.value)
  }

  const setEditingFont = (font: IThemeFont) => {
    Object.assign(editingFont, font)
    Object.assign(editingFontSource, font)
    editing.value = true
  }

  const validateFont = (): boolean => {
    fontError.value = undefined
    if (!editingFont.name) {
      fontError.value = t('errors.font_name_missing')
    } else if (
      editingFont.name !== editingFontSource.name &&
      editingFont.name in (site.value?.context.theme.fonts ?? {})
    ) {
      fontError.value = t('errors.font_name_unique')
    } else if (editingFont.source !== ThemeFontSource.Native && !editingFont.fallback) {
      fontError.value = t('errors.font_fallback_missing')
    }
    return !fontError.value
  }

  const saveFont = () => {
    if (!editing.value || !validateFont()) {
      return
    }
    const oldName = editingFontSource.name
    if (oldName in (site.value?.context.theme.fonts ?? {})) {
      // Pass in the copy of variables to avoid passing by reference issue
      editThemeFont({ ...editingFontSource }, { ...editingFont })
    } else {
      addThemeFont(editingFont.source, editingFont.name, editingFont.fallback)
    }
    clearEditingState()
  }

  return {
    editing,
    editingFont,
    selectedGoogleFonts,
    fontError,
    fonts,
    clearEditingState,
    newFont,
    setEditingFont,
    saveFont,
  }
}
