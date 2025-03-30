import { IEditorContext } from '@pubstudio/shared/type-site'

// Divide offsets by `builderScale` because `.build-content-window-inner` scales
// based on `builderScale` in the editor context.
export const normalizeDimensions = (
  editor: IEditorContext | undefined,
  overlayTop: number,
  overlayLeft: number,
  overlayWidth: number,
  overlayHeight: number,
  buildContentWindowInner: HTMLElement,
) => {
  const builderScale = editor?.builderScale ?? 1

  let top = overlayTop / builderScale
  let left = overlayLeft / builderScale
  const width = overlayWidth / builderScale
  const height = overlayHeight / builderScale

  top += buildContentWindowInner.scrollTop
  left += buildContentWindowInner.scrollLeft

  return {
    left,
    top,
    width,
    height,
  }
}

export const computeRelativeRect = (
  buildContentWindowInner: HTMLElement,
  element: HTMLElement,
) => {
  const { top: buildContentWindowTop, left: buildContentWindowLeft } =
    buildContentWindowInner.getBoundingClientRect()

  const {
    top: elementTop,
    right: elementRight,
    bottom: elementBottom,
    left: elementLeft,
    width: elementWidth,
    height: elementHeight,
  } = element.getBoundingClientRect()

  const relativeTop = elementTop - buildContentWindowTop
  const relativeRight = elementRight - buildContentWindowLeft
  const relativeBottom = elementBottom - buildContentWindowTop
  const relativeLeft = elementLeft - buildContentWindowLeft

  return {
    relativeTop,
    relativeRight,
    relativeBottom,
    relativeLeft,
    elementWidth,
    elementHeight,
  }
}
