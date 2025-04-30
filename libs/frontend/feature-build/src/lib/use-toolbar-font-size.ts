import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { Css } from '@pubstudio/shared/type-site'
import { Ref, ref, watch } from 'vue'
import { useToolbar } from './use-toolbar'
import {
  IUseToolbarResumeTextFocus,
  useToolbarResumeTextFocus,
} from './use-toolbar-resume-text-focus'

export interface IUseToolbarFontSize {
  fontSize: Ref<IFontSize>
  fontSizeTextFocus: IUseToolbarResumeTextFocus
  setFontSize: () => void
  setFontUnit: (unit: string | undefined) => void
}

export interface IFontSize {
  size: string
  unit: string
}

export const useToolbarFontSize = (): IUseToolbarFontSize => {
  const { editor } = useSiteSource()
  const { getResolvedOrSelectedStyle, setStyle, refocusSelection, selectionStyles } =
    useToolbar()
  const fontSizeTextFocus = useToolbarResumeTextFocus({ editor })

  const fontSize = ref<IFontSize>({ size: '', unit: 'px' })

  const updateFontSize = () => {
    const value = getResolvedOrSelectedStyle(Css.FontSize)?.value
    const unit = value?.replace(/[\d\s.]/g, '')
    fontSize.value = {
      size: value?.replace(/[^0-9.]/g, '') ?? '',
      unit: unit || 'px',
    }
  }

  const setFontUnit = (unit: string | undefined) => {
    fontSize.value.unit = unit || 'px'
    setFontSize()
  }

  const setFontSize = () => {
    if (fontSizeTextFocus.textWasFocused.value) {
      refocusSelection()
    } else {
      fontSizeTextFocus.toolbarItemRef.value?.inputRef?.blur()
    }
    try {
      const size = parseInt(fontSize.value.size)
      if (size > 1 && size < 1000) {
        setStyle(Css.FontSize, `${size}${fontSize.value.unit}`)
      }
    } catch (e) {
      console.log('Font size error:', e)
    }
  }

  watch(
    () => [
      editor?.value?.selectedComponent,
      editor.value?.cssPseudoClass,
      selectionStyles,
    ],
    () => {
      updateFontSize()
    },
    {
      deep: true,
      immediate: true,
    },
  )

  return {
    fontSize,
    fontSizeTextFocus,
    setFontSize,
    setFontUnit,
  }
}
