import { Css } from '@pubstudio/shared/type-site'
import { Ref, ref, watch } from 'vue'
import { useBuild } from './use-build'
import { useToolbar } from './use-toolbar'

export interface IUseToolbarFontSize {
  fontSizePsInputRef: Ref
  fontSize: Ref<IFontSize>
  setFontSize: () => void
}

export interface IFontSize {
  size: string
  suffix: string
}

export const useToolbarFontSize = (): IUseToolbarFontSize => {
  const { editor } = useBuild()
  const { getResolvedOrSelectedStyle, setStyle, selectionStyles } = useToolbar()

  const psInputRef = ref()
  const fontSize = ref<IFontSize>({ size: '', suffix: 'px' })

  const updateFontSize = () => {
    const value = getResolvedOrSelectedStyle(Css.FontSize)?.value
    const unit = value?.replace(/[\d\s.]/g, '')
    fontSize.value = {
      size: value?.replace(/[^0-9.]/g, '') ?? '',
      suffix: unit || 'px',
    }
  }

  const setFontSize = () => {
    if (!editor.value?.editView?.state.selection?.empty) {
      editor.value?.editView?.focus()
    }
    try {
      const size = parseInt(fontSize.value.size)
      if (size > 1 && size < 1000) {
        setStyle(Css.FontSize, `${size}${fontSize.value.suffix}`)
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
  }
}
