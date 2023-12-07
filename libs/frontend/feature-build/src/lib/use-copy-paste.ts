import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { useHUD } from '@pubstudio/frontend/util-ui-alert'
import { ISerializedComponent } from '@pubstudio/shared/type-site'
import { useBuild } from './use-build'

// Export functions for testing
export interface IUseCopyPaste {
  pressCopy(evt: KeyboardEvent): void
  pressPaste(evt: KeyboardEvent): void
  pasteStyle(copiedComponent: ISerializedComponent): void
  pasteComponent(copiedComponent: ISerializedComponent): void
}

export const useCopyPaste = (): IUseCopyPaste => {
  const {
    site,
    editor,
    mergeComponentStyle,
    pasteComponent: executePasteComponent,
  } = useBuild()
  const { addHUD } = useHUD()

  const pressCopy = (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    const component = editor.value?.selectedComponent
    if (site.value.editor && component && (evt.ctrlKey || evt.metaKey)) {
      site.value.editor.copiedComponent = serializeComponent(component)
      // TODO -- find a good way to handle translations without requiring library consumers
      // to use `vue-i18n`
      addHUD({ text: 'Copied' })
    }
  }

  const pasteStyle = (copiedComponent: ISerializedComponent): void => {
    mergeComponentStyle(copiedComponent)
    addHUD({
      text: 'Style Pasted',
    })
  }

  const pasteComponent = (copiedComponent: ISerializedComponent): void => {
    const { selectedComponent } = site.value.editor ?? {}
    if (!selectedComponent) return

    // If the copied component is still selected, paste to its parent
    if (copiedComponent.id === selectedComponent.id) {
      const parent = selectedComponent.parent
      if (parent) {
        executePasteComponent(copiedComponent.id, parent)
      }
    } else {
      executePasteComponent(copiedComponent.id, selectedComponent)
    }
    addHUD({ text: 'Component Pasted' })
  }

  const pressPaste = (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    const { selectedComponent } = editor.value ?? {}
    const { copiedComponent } = site.value.editor ?? {}
    if (selectedComponent && copiedComponent && (evt.ctrlKey || evt.metaKey)) {
      if (!copiedComponent.parentId) {
        // Root component should not be pasted through paste hotkey.
        addHUD({
          text: 'Root component can only be used to replace another root component',
        })
      } else if (evt.shiftKey) {
        // Make sure we don't paste style to the same component
        if (selectedComponent.id !== copiedComponent.id) {
          pasteStyle(copiedComponent)
        }
      } else {
        pasteComponent(copiedComponent)
      }
    }
  }

  return {
    pressCopy,
    pressPaste,
    pasteStyle,
    pasteComponent,
  }
}
