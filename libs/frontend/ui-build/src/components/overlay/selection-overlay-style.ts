import { buildContentWindowInnerId } from '@pubstudio/frontend/feature-build'
import { IComponent, IEditorContext } from '@pubstudio/shared/type-site'
import { sleep } from '@pubstudio/shared/util-core'
import { normalizeDimensions } from './overlay-util'

export interface ISelectionOverlay {
  top: number
  left: number
  width: number
  height: number
}

export const computeSelectionOverlay = async (
  editor: IEditorContext | undefined,
  selectedComponent: IComponent | undefined,
): Promise<ISelectionOverlay | undefined> => {
  if (selectedComponent) {
    // This sleep is necessary for buildContentWindowInner and componentElement
    await sleep(1)

    const buildContentWindowInner = document.getElementById(buildContentWindowInnerId)
    let componentElement = document.getElementById(selectedComponent.id)
    // Container size might be different from the actual component
    const containerChild = componentElement?.children?.[0]
    if (containerChild?.className?.includes('component-content-container')) {
      componentElement = containerChild.children?.[0] as HTMLElement
    }

    if (buildContentWindowInner && componentElement) {
      const { top: buildContentWindowTop, left: buildContentWindowLeft } =
        buildContentWindowInner.getBoundingClientRect()

      const {
        top: elementTop,
        left: elementLeft,
        width: elementWidth,
        height: elementHeight,
      } = componentElement.getBoundingClientRect()

      const elementRelativeTop = elementTop - buildContentWindowTop
      const elementRelativeLeft = elementLeft - buildContentWindowLeft

      const { top, left, width, height } = normalizeDimensions(
        editor,
        elementRelativeTop,
        elementRelativeLeft,
        elementWidth,
        elementHeight,
        buildContentWindowInner,
      )

      return {
        top,
        left,
        width,
        height,
      }
    }
  }
  return undefined
}
