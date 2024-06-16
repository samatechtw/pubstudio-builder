import { buildContentWindowInnerId } from '@pubstudio/frontend/feature-build'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { IEditorContext } from '@pubstudio/shared/type-site'
import { computeRelativeRect, normalizeDimensions } from './overlay-util'

const hoverOutlineThickness = 6
const outlineColor = '#000'
const selfOutlineColor = '#F82389'

export const computeHoverOverlayStyle = (editor: IEditorContext | undefined) => {
  const buildDndState = runtimeContext.buildDndState.value
  if (buildDndState) {
    const buildContentWindowInner = document.getElementById(buildContentWindowInnerId)
    const hoverElement = document.getElementById(buildDndState.hoverCmpId)

    if (buildContentWindowInner && hoverElement) {
      const {
        hoverSelf,
        hoverTop,
        hoverRight,
        hoverBottom,
        hoverLeft,
        hoverCmpParentIsRow,
      } = buildDndState

      const {
        relativeTop,
        relativeRight,
        relativeBottom,
        relativeLeft,
        elementWidth,
        elementHeight,
      } = computeRelativeRect(buildContentWindowInner, hoverElement)

      const builderScale = editor?.builderScale ?? 1
      const outlineThickness = Math.min(
        hoverOutlineThickness,
        hoverOutlineThickness * builderScale,
      )

      let [overlayTop, overlayLeft, overlayWidth, overlayHeight] = [0, 0, 0, 0]
      let [overlayBackgroundColor, overlayBorder] = ['', '']

      overlayTop = relativeTop
      overlayLeft = relativeLeft
      if (hoverSelf) {
        overlayWidth = elementWidth
        overlayHeight = elementHeight
        overlayBorder = `2px solid ${selfOutlineColor}`
      } else if (hoverCmpParentIsRow) {
        if (hoverLeft) {
          overlayWidth = outlineThickness
          overlayHeight = elementHeight
          overlayBackgroundColor = outlineColor
        } else if (hoverRight) {
          overlayTop = relativeTop
          overlayLeft = relativeRight - outlineThickness
          overlayWidth = outlineThickness
          overlayHeight = elementHeight
          overlayBackgroundColor = outlineColor
        }
      } else {
        if (hoverTop) {
          overlayWidth = elementWidth
          overlayHeight = outlineThickness
          overlayBackgroundColor = outlineColor
        } else if (hoverBottom) {
          overlayTop = relativeBottom - outlineThickness
          overlayWidth = elementWidth
          overlayHeight = outlineThickness
          overlayBackgroundColor = outlineColor
        }
      }

      const { top, left, width, height } = normalizeDimensions(
        editor,
        overlayTop,
        overlayLeft,
        overlayWidth,
        overlayHeight,
        buildContentWindowInner,
      )

      return {
        top: `${top}px`,
        left: `${left}px`,
        // -1 to prevent horizontal scrollbar from showing up.
        width: `${width - 1}px`,
        height: `${height}px`,
        backgroundColor: overlayBackgroundColor,
        border: overlayBorder,
      }
    }
  }
  return undefined
}
