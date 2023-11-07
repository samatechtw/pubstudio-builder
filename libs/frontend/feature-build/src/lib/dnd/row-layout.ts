import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-build'
import {
  Css,
  CssPseudoClass,
  IComponent,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { IDropProps } from './builder-dnd'

export interface XYCoord {
  x: number
  y: number
}

interface IHandleHoverProps {
  mousePosition: XYCoord
  targetMiddle: XYCoord
  haveSameParent: boolean
  dragComponentIndex: number
  hoverCmpIndex: number
  dropProps: IDropProps
}

export const isRowLayout = (
  context: ISiteContext,
  component: IComponent | undefined,
): boolean => {
  const direction = resolvedComponentStyle(
    context,
    component,
    CssPseudoClass.Default,
    Css.FlexDirection,
    activeBreakpoint.value.id,
  )
  // TODO -- if not set in custom or mixins, `flex-direction` may be inherited. Otherwise it defaults to
  // the DOM parent's direction (or `row` if no parent sets a direction)
  return direction === 'row' || direction === undefined
}

export const handleRowLayoutHover = (props: IHandleHoverProps) => {
  const {
    mousePosition,
    targetMiddle,
    haveSameParent,
    dragComponentIndex,
    hoverCmpIndex,
    dropProps,
  } = props

  const hoverLeft =
    mousePosition.x < targetMiddle.x &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex - 1)

  const hoverRight =
    mousePosition.x > targetMiddle.x &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex + 1)

  dropProps.hoverLeft = hoverLeft
  dropProps.hoverRight = hoverRight
  dropProps.destinationIndex = hoverCmpIndex

  // Calculate destination index
  if (hoverLeft) {
    if (haveSameParent && dragComponentIndex <= hoverCmpIndex) {
      dropProps.destinationIndex = hoverCmpIndex - 1
    }
  } else if (hoverRight) {
    if (haveSameParent) {
      if (dragComponentIndex > hoverCmpIndex) {
        dropProps.destinationIndex = hoverCmpIndex + 1
      }
    } else {
      dropProps.destinationIndex = hoverCmpIndex + 1
    }
  }
}

export const handleColumnLayoutHover = (props: IHandleHoverProps) => {
  const {
    mousePosition,
    targetMiddle,
    haveSameParent,
    dragComponentIndex,
    hoverCmpIndex,
    dropProps,
  } = props

  const hoverTop =
    mousePosition.y < targetMiddle.y &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex - 1)

  const hoverBottom =
    mousePosition.y > targetMiddle.y &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex + 1)

  dropProps.hoverTop = hoverTop
  dropProps.hoverBottom = hoverBottom
  dropProps.destinationIndex = hoverCmpIndex

  // Calculate destination index
  if (hoverTop) {
    if (haveSameParent && dragComponentIndex <= hoverCmpIndex) {
      dropProps.destinationIndex = hoverCmpIndex - 1
    }
  } else if (hoverBottom) {
    if (haveSameParent) {
      if (dragComponentIndex > hoverCmpIndex) {
        dropProps.destinationIndex = hoverCmpIndex + 1
      }
    } else {
      dropProps.destinationIndex = hoverCmpIndex + 1
    }
  }
}
