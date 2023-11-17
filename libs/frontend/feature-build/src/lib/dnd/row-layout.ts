import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { Css, IComponent, ISite } from '@pubstudio/shared/type-site'
import { IDropProps } from './builder-dnd'
import { findStyles } from '@pubstudio/frontend/util-component'

export interface XYCoord {
  x: number
  y: number
}

interface IHandleHoverProps {
  mousePosition: XYCoord
  hoverCmpRect: DOMRect
  haveSameParent: boolean
  dragComponentIndex: number
  hoverCmpIndex: number
  dropProps: IDropProps
}

export const isRowLayout = (site: ISite, component: IComponent | undefined): boolean => {
  if (!component) {
    return false
  }
  const styles = findStyles(
    [Css.Display, Css.FlexDirection],
    site,
    component,
    descSortedBreakpoints.value,
    activeBreakpoint.value,
  )
  const [display, direction] = [styles[Css.Display], styles[Css.FlexDirection]]
  return (
    display === 'flex' &&
    (direction === 'row' || direction === 'row-reverse' || direction === undefined)
  )
}

export const handleRowLayoutHover = (props: IHandleHoverProps) => {
  const {
    mousePosition,
    hoverCmpRect,
    haveSameParent,
    dragComponentIndex,
    hoverCmpIndex,
    dropProps,
  } = props

  const { left, right, width } = hoverCmpRect
  const hoverableWidth = Math.min(8, width * 0.15)

  const hoverLeft =
    mousePosition.x >= left &&
    mousePosition.x <= left + hoverableWidth &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex - 1)

  const hoverRight =
    mousePosition.x <= right &&
    mousePosition.x >= right - hoverableWidth &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex + 1)

  dropProps.hoverLeft = hoverLeft
  dropProps.hoverRight = hoverRight

  // Calculate destination index
  if (hoverLeft) {
    dropProps.destinationIndex = hoverCmpIndex
    if (haveSameParent && dragComponentIndex <= hoverCmpIndex) {
      dropProps.destinationIndex = hoverCmpIndex - 1
    }
  } else if (hoverRight) {
    dropProps.destinationIndex = hoverCmpIndex
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
    hoverCmpRect,
    haveSameParent,
    dragComponentIndex,
    hoverCmpIndex,
    dropProps,
  } = props

  const { top, bottom, height } = hoverCmpRect
  const hoverableHeight = Math.min(8, height * 0.15)

  const hoverTop =
    mousePosition.y >= top &&
    mousePosition.y <= top + hoverableHeight &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex - 1)

  const hoverBottom =
    mousePosition.y <= bottom &&
    mousePosition.y >= bottom - hoverableHeight &&
    (!haveSameParent || dragComponentIndex !== hoverCmpIndex + 1)

  dropProps.hoverTop = hoverTop
  dropProps.hoverBottom = hoverBottom

  // Calculate destination index
  if (hoverTop) {
    dropProps.destinationIndex = hoverCmpIndex
    if (haveSameParent && dragComponentIndex <= hoverCmpIndex) {
      dropProps.destinationIndex = hoverCmpIndex - 1
    }
  } else if (hoverBottom) {
    dropProps.destinationIndex = hoverCmpIndex
    if (haveSameParent) {
      if (dragComponentIndex > hoverCmpIndex) {
        dropProps.destinationIndex = hoverCmpIndex + 1
      }
    } else {
      dropProps.destinationIndex = hoverCmpIndex + 1
    }
  }
}
