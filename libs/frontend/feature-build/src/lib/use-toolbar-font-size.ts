import { Css } from '@pubstudio/shared/type-site'
import { Ref, ref, watch } from 'vue'
import { useBuild } from './use-build'
import { useToolbar } from './use-toolbar'

export interface IUseToolbarFontSize {
  fontSizePsInputRef: Ref
  fontSize: Ref<IFontSize>
  setFontSize: () => void
  setFontUnit: (unit: string | undefined) => void
}

export interface IFontSize {
  size: string
  unit: string
}

export const useToolbarFontSize = (): IUseToolbarFontSize => {
  const { editor } = useBuild()
  const { getResolvedOrSelectedStyle, setStyle, refocusSelection, selectionStyles } =
    useToolbar()

  const psInputRef = ref()
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
    refocusSelection()
    try {
      const size = parseInt(fontSize.value.size)
      if (size > 1 && size < 1000) {
        setStyle(Css.FontSize, `${size}${fontSize.value.unit}`)
        psInputRef.value?.inputRef?.blur()
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
    fontSizePsInputRef: psInputRef,
    fontSize,
    setFontSize,
    setFontUnit,
  }
}
