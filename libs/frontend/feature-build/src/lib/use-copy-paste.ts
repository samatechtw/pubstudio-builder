import { replaceComponentNamespace } from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent } from '@pubstudio/frontend/util-site-store'
import { useToast } from '@pubstudio/frontend/util-ui-alert'
import { ISerializedComponent } from '@pubstudio/shared/type-site'
import { useBuild } from './use-build'

// Export functions for testing
export interface IUseCopyPaste {
  pressCopy(evt: KeyboardEvent): void
  pressPaste(evt: KeyboardEvent): Promise<void>
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
  const { addHUD } = useToast()

  const pressCopy = (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    const component = editor.value?.selectedComponent
    if (site.value.editor && component && (evt.ctrlKey || evt.metaKey)) {
      const serialized = serializeComponent(component)
      site.value.editor.copiedComponent = serialized
      // TODO -- find a good way to handle translations without requiring library consumers
      // to use `vue-i18n`
      addHUD({ text: 'Copied' })

      // Firefox doesn't support clipboard.write ^_^
      if (typeof ClipboardItem && navigator.clipboard.write) {
        navigator.clipboard.write([
          new ClipboardItem({
            'web text/pubstudio': new Blob([JSON.stringify(serialized)], {
              type: 'web text/pubstudio',
            }),
            'text/plain': new Blob([serialized.content ?? ''], { type: 'text/plain' }),
          }),
        ])
      }
    }
  }

  const pasteStyle = (copiedComponent: ISerializedComponent): void => {
    mergeComponentStyle(copiedComponent)
    addHUD({ text: 'Style Pasted' })
  }

  const pasteComponent = (copiedComponent: ISerializedComponent): void => {
    const { selectedComponent } = site.value.editor ?? {}
    if (!selectedComponent) return

    // If the copied component is still selected, paste to its parent
    if (copiedComponent.id === selectedComponent.id) {
      const parent = selectedComponent.parent
      if (parent) {
        executePasteComponent(copiedComponent, parent)
      }
    } else {
      executePasteComponent(copiedComponent, selectedComponent)
    }
    addHUD({ text: 'Component Pasted' })
  }

  // Attempt to paste a component from the clipboard. Return true if successful
  const pasteClipboardComponent = async (): Promise<boolean> => {
    try {
      // Iterate over all clipboard items.
      const clipboardItems = await navigator.clipboard.read()
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          // Discard any types that are not pubstudio's custom format
          if (type !== 'web text/pubstudio') {
            continue
          }
          const blob = await clipboardItem.getType(type)
          const serialized = JSON.parse(await blob.text()) as ISerializedComponent
          const namespace = site.value.context.namespace
          const sourceNamespace = parseNamespace(serialized.id)
          if (sourceNamespace) {
            replaceComponentNamespace(serialized, sourceNamespace, namespace)
          }
          pasteComponent(serialized)
          console.log(namespace, sourceNamespace)
          console.log('CLIP', serialized)
          return true
        }
      }
    } catch (err) {
      console.error('Failed to paste from clipboard', err)
    }
    return false
  }

  const pressPaste = async (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    if (await pasteClipboardComponent()) {
      return
    }
    const { selectedComponent } = editor.value ?? {}
    const { copiedComponent } = site.value.editor ?? {}
    if (selectedComponent && copiedComponent) {
      if (evt.shiftKey) {
        // Make sure we don't paste style to the same component
        if (selectedComponent.id !== copiedComponent.id) {
          pasteStyle(copiedComponent)
        }
      } else {
        if (!copiedComponent.parentId) {
          // Root component should not be pasted through paste hotkey.
          addHUD({
            text: 'Root component can only be used to replace another root component',
            duration: 2000,
          })
        } else {
          pasteComponent(copiedComponent)
        }
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
