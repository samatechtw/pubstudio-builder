import { IComponentPosition } from '@pubstudio/shared/type-command-data'
import { IComponent, ISiteContext, Tag } from '@pubstudio/shared/type-site'
import { IDraggedComponent, IDropProps } from './builder-dnd'
import {
  handleColumnLayoutHover,
  handleRowLayoutHover,
  isRowLayout,
  XYCoord,
} from './row-layout'

export interface IDropResult {
  from: IComponentPosition
  to: IComponentPosition
}

const getMousePosition = (e: DragEvent): XYCoord => {
  return { x: e.clientX, y: e.clientY }
}

const checkSelfDrop = (
  component: IComponent,
  parentIsRow: boolean,
  rect: DOMRect,
  mouse: XYCoord,
): boolean => {
  if (!component.content && component.tag !== Tag.Img) {
    if (parentIsRow) {
      const borderX = Math.min(rect.width * 0.2, 100)
      const left = rect.left + borderX
      const right = rect.right - borderX

      return mouse.x > left && mouse.x < right
    } else {
      const borderY = Math.min(rect.height * 0.2, 100)
      const top = rect.top + borderY
      const bottom = rect.bottom - borderY

      return mouse.y > top && mouse.y < bottom
    }
  }
  return false
}

export const onDrag = (
  e: DragEvent,
  context: ISiteContext,
  dragSrc: IDraggedComponent,
  targetIndex: number,
  target: IComponent,
  elementRef: HTMLElement | undefined,
  // Only check for top&bottom hover
  verticalOnly?: boolean,
): IDropProps => {
  const dropProps: IDropProps = {
    hoverSelf: false,
    hoverTop: false,
    hoverRight: false,
    hoverBottom: false,
    hoverLeft: false,
    destinationIndex: 0,
  }
  if (elementRef) {
    const dragCmpParentId = dragSrc.parentId
    const dragComponentIndex = dragSrc.index

    const haveSameParent = dragCmpParentId === target.parent?.id

    if (
      dragCmpParentId !== target.id &&
      (!haveSameParent || dragComponentIndex !== targetIndex)
    ) {
      const targetRect = elementRef.getBoundingClientRect()
      const targetMiddle: XYCoord = {
        x: (targetRect.right + targetRect.left) / 2,
        y: (targetRect.bottom + targetRect.top) / 2,
      }

      const mousePosition = getMousePosition(e)
      const parentIsRow = isRowLayout(context, target.parent)

      if (checkSelfDrop(target, parentIsRow, targetRect, mousePosition)) {
        dropProps.hoverSelf = true
        dropProps.destinationIndex = target.children?.length ?? 0
        return dropProps
      }

      if (!parentIsRow || verticalOnly) {
        handleColumnLayoutHover({
          mousePosition,
          targetMiddle,
          haveSameParent,
          dragComponentIndex,
          targetIndex,
          dropProps,
        })
      } else {
        handleRowLayoutHover({
          mousePosition,
          targetMiddle,
          haveSameParent,
          dragComponentIndex,
          targetIndex,
          dropProps,
        })
      }
    }
  }
  return dropProps
}

export const onDrop = (
  component: IComponent,
  dragComponent: IDraggedComponent,
  props: IDropProps,
): IDropResult | undefined => {
  const dropOnSelf = dragComponent.componentId === component.id
  if (!dropOnSelf && props.destinationIndex >= 0) {
    const from: IComponentPosition = {
      parentId: dragComponent.parentId as string,
      index: dragComponent.index,
    }
    const toCmp = props.hoverSelf ? component : component.parent
    const to: IComponentPosition = {
      parentId: toCmp?.id as string,
      index: props.destinationIndex,
    }
    return { from, to }
  }
  return undefined
}
