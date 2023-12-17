import { IEditorContext } from '@pubstudio/shared/type-site'
import { Ref, ref } from 'vue'

export interface IUseToolbarResumeTextFocus {
  textWasFocused: Ref<boolean>
  toolbarItemRef: Ref<HTMLElement | undefined>
  toolbarButtonMouseDown: () => void
}

export interface IUseToolbarResumeTextFocusOptions {
  editor: Ref<IEditorContext | undefined>
}

export const useToolbarResumeTextFocus = (options: IUseToolbarResumeTextFocusOptions) => {
  const { editor } = options
  const textWasFocused = ref(false)
  const toolbarItemRef = ref()

  const mouseup = (e: MouseEvent) => {
    document.removeEventListener('mouseup', mouseup)
    const clicked = toolbarItemRef.value.$el.contains?.(e.target)
    if (!clicked) {
      textWasFocused.value = false
    }
  }

  const toolbarButtonMouseDown = () => {
    textWasFocused.value = !!editor.value?.editView?.hasFocus()
    document.addEventListener('mouseup', mouseup)
  }

  return {
    textWasFocused,
    toolbarItemRef,
    toolbarButtonMouseDown,
  }
}
