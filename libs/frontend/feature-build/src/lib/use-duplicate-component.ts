import { useHUD } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from './use-build'

export interface IUseDuplicateComponet {
  pressDuplicate: (evt: KeyboardEvent) => void
  duplicateSelectedComponent: () => void
}

export const useDuplicateComponent = (): IUseDuplicateComponet => {
  const { editor, duplicateComponent } = useBuild()
  const { addHUD } = useHUD()

  const pressDuplicate = (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    evt.preventDefault()
    const { selectedComponent } = editor.value ?? {}
    if (
      selectedComponent &&
      // Make sure selected component is not root component
      selectedComponent.parent &&
      (evt.ctrlKey || evt.metaKey)
    ) {
      duplicateSelectedComponent()
    }
  }

  const duplicateSelectedComponent = () => {
    duplicateComponent()
    addHUD({ text: 'Component Duplicated' })
  }

  return {
    pressDuplicate,
    duplicateSelectedComponent,
  }
}
