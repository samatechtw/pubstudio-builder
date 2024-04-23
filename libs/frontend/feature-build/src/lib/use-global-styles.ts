import { setEditGlobalStyle } from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { IEditGlobalStyle } from '@pubstudio/shared/type-site'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { addGlobalStyle, setGlobalStyle } from './command-wrap/global-style'

export interface IUseGlobalStylesFeature {
  editGlobalStyle: ComputedRef<IEditGlobalStyle | undefined>
  globalStyleError: Ref<string | undefined>
  globalStyleNames: ComputedRef<Array<string>>
  resetEditGlobalStyles: () => void
  newGlobalStyle: () => void
  setEditingGlobalStyle: (name: string) => void
  saveGlobalStyle: () => void
}

const globalStyleError = ref<string | undefined>()

export const useGlobalStyles = (): IUseGlobalStylesFeature => {
  const { t } = useI18n()
  const { site } = useSiteSource()

  const editGlobalStyle = computed(() => {
    return site.value.editor?.editGlobalStyle
  })

  const globalStyleNames = computed(() => {
    return Object.keys(site.value.context.globalStyles)
  })

  const resetEditGlobalStyles = () => {
    setEditGlobalStyle(site.value.editor, undefined)
    globalStyleError.value = undefined
  }

  const newGlobalStyle = () => {
    setEditGlobalStyle(site.value.editor, {
      oldName: undefined,
      newName: '',
      style: '',
    })
  }

  const setEditingGlobalStyle = (name: string) => {
    setEditGlobalStyle(site.value.editor, {
      oldName: name,
      newName: name,
      style: site.value.context.globalStyles[name]?.style ?? '',
    })
  }

  const styleExists = (name: string): boolean => {
    return name in (site.value.context.globalStyles ?? {})
  }

  const validateGlobalStyle = (): boolean => {
    globalStyleError.value = undefined
    const { oldName, newName } = editGlobalStyle.value ?? {}
    if (!newName) {
      globalStyleError.value = t('errors.style_name_missing')
    } else if (newName !== oldName && styleExists(newName)) {
      globalStyleError.value = t('errors.style_name_unique')
    }
    return !globalStyleError.value
  }

  const saveGlobalStyle = () => {
    if (!editGlobalStyle.value || !validateGlobalStyle()) {
      return
    }
    const { oldName, newName, style } = editGlobalStyle.value ?? {}
    if (oldName && styleExists(oldName)) {
      setGlobalStyle(site.value, oldName, newName, { style })
    } else {
      addGlobalStyle(site.value, newName as string, { style })
    }
    resetEditGlobalStyles()
  }

  return {
    editGlobalStyle,
    globalStyleError,
    globalStyleNames,
    resetEditGlobalStyles,
    newGlobalStyle,
    setEditingGlobalStyle,
    saveGlobalStyle,
  }
}
