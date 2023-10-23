import { useHUD } from '@pubstudio/frontend/ui-widgets'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
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
    if (
      site.value.editor &&
      // Make sure selected component is not page root before copying
      component?.parent &&
      (evt.ctrlKey || evt.metaKey)
    ) {
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

    if (selectedComponent.content) {
      addHUD({ text: "Can't paste into a component with text content" })
    } else {
      // If the copied component is still selected, paste to its parent
      if (copiedComponent.id === selectedComponent.id) {
        const parentId = selectedComponent.parent?.id
        if (parentId) {
          executePasteComponent(copiedComponent.id, parentId)
        }
      } else {
        executePasteComponent(copiedComponent.id, selectedComponent.id)
      }
      addHUD({ text: 'Component Pasted' })
    }
  }

  const pressPaste = (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    const { selectedComponent } = editor.value ?? {}
    const { copiedComponent } = site.value.editor ?? {}
    if (selectedComponent && copiedComponent && (evt.ctrlKey || evt.metaKey)) {
      if (evt.shiftKey) {
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
