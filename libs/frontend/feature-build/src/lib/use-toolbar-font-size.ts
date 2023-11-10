import { ComputedRef, Ref, computed, ref, watch } from 'vue'
import { useToolbar } from './use-toolbar'
import { Css } from '@pubstudio/shared/type-site'
import { useBuild } from './use-build'

export interface IUseToolbarFontSize {
  fontSizePsInputRef: Ref
  fontSize: Ref<string>
  fontSizeSuffix: ComputedRef<string>
  setFontSize: () => void
}

export const useToolbarFontSize = (): IUseToolbarFontSize => {
  const { editor } = useBuild()
  const { getStyleValue, setStyle } = useToolbar()

  const psInputRef = ref()
  const fontSize = ref('')

  const fontSizeSuffix = computed(() => {
    const value = getStyleValue(Css.FontSize)
    const unit = value?.replace(/[\d\s.]/g, '')
    return unit || 'px'
  })

  const setFontSize = () => {
    try {
      const size = parseInt(fontSize.value)
      if (size > 1 && size < 1000) {
        setStyle(Css.FontSize, `${size}${fontSizeSuffix.value}`)
        psInputRef.value?.inputRef?.blur()
      }
    } catch (e) {
      console.log('Font size error:', e)
    }
  }

  watch(
    () => [editor?.value?.selectedComponent, editor.value?.cssPseudoClass],
    () => {
      const size = getStyleValue(Css.FontSize)
      fontSize.value = size?.replace(/[^0-9.]/g, '') ?? ''
    },
    {
      immediate: true,
    },
  )

  return {
    fontSizePsInputRef: psInputRef,
    fontSize,
    setFontSize,
    fontSizeSuffix,
  }
}
