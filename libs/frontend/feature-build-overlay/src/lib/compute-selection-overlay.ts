import { buildContentWindowInnerId } from '@pubstudio/frontend/feature-build'
import { IComponentOverlay } from '@pubstudio/frontend/type-ui-widgets'
import { IEditorContext } from '@pubstudio/shared/type-site'
import { normalizeDimensions } from './overlay-util'

export const computeSelectionOverlay = (
  editor: IEditorContext | undefined,
  selectedComponentId: string | undefined,
): IComponentOverlay | undefined => {
  if (selectedComponentId) {
    const buildContentWindowInner = document.getElementById(buildContentWindowInnerId)
    let componentElement = document.getElementById(selectedComponentId)
    // Container size might be different from the actual component
    const containerChildren = componentElement?.children
    if (containerChildren?.[0]?.className?.includes('component-content-container')) {
      componentElement = containerChildren?.[0] as HTMLElement
    } else if (containerChildren?.[1]?.className === '__link-placeholder') {
      componentElement = containerChildren?.[1] as HTMLElement
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
