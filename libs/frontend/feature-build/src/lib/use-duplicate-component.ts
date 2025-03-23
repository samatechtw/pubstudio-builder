import { addHUD } from '@pubstudio/frontend/util-ui-alert'
import { useBuild } from './use-build'

export interface IUseDuplicateComponet {
  pressDuplicate: (evt: KeyboardEvent) => void
  duplicateSelectedComponent: () => void
}

export const useDuplicateComponent = (): IUseDuplicateComponet => {
  const { editor, duplicateComponent } = useBuild()

  const pressDuplicate = (evt: KeyboardEvent) => {
    evt.stopImmediatePropagation()
    evt.preventDefault()
    const { selectedComponent } = editor.value ?? {}
    if (
      selectedComponent &&
      // Make sure selected component is not root component
      selectedComponent.parent
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
