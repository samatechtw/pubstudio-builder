import { IComponentPosition } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { IDraggedComponent, IDropProps } from './builder-dnd'
import {
  handleColumnLayoutHover,
  handleRowLayoutHover,
  isRowLayout,
  XYCoord,
} from './row-layout'
import { defaultDropProps } from './use-drag-drop'

export interface IDropResult {
  from: IComponentPosition
  to: IComponentPosition
}

export interface IOnDragOptions {
  e: DragEvent
  site: ISite
  isFile: boolean
  dragSrc: IDraggedComponent | undefined
  hoverCmpIndex: number
  hoverCmp: IComponent
  elementRef: HTMLElement | undefined
  // Only check for top&bottom hover
  verticalOnly?: boolean
}

const getMousePosition = (e: DragEvent): XYCoord => {
  return { x: e.clientX, y: e.clientY }
}

export const onDrag = (options: IOnDragOptions): IDropProps => {
  const { e, site, isFile, dragSrc, hoverCmpIndex, hoverCmp, elementRef, verticalOnly } =
    options

  const dropProps = defaultDropProps()

  if (elementRef) {
    const dragCmpParentId = dragSrc?.parentId
    const dragComponentIndex = dragSrc?.index ?? 0

    const hoverOnRoot = !hoverCmp.id.startsWith('global') && !hoverCmp.parent
    const haveSameParent = dragCmpParentId === hoverCmp.parent?.id

    const addNewComponentToRoot = hoverOnRoot && !!dragSrc?.addData
    if (
      !haveSameParent ||
      dragComponentIndex !== hoverCmpIndex ||
      addNewComponentToRoot
    ) {
      const hoverCmpRect = elementRef.getBoundingClientRect()

      const mousePosition = getMousePosition(e)
      const parentIsRow = isRowLayout(site, hoverCmp.parent)
      dropProps.parentIsRow = parentIsRow

      // User should not be able to drop component at the top/right/bottom/left side of root component.
      if (!hoverOnRoot) {
        if (!parentIsRow || verticalOnly) {
          handleColumnLayoutHover({
            mousePosition,
            hoverCmpRect,
            haveSameParent,
            dragComponentIndex,
            hoverCmpIndex,
            dropProps,
          })
          if (dropProps.hoverTop || dropProps.hoverBottom) {
            return dropProps
          }
        } else {
          handleRowLayoutHover({
            mousePosition,
            hoverCmpRect,
            haveSameParent,
            dragComponentIndex,
            hoverCmpIndex,
            dropProps,
          })
          if (dropProps.hoverLeft || dropProps.hoverRight) {
            return dropProps
          }
        }
      }

      if (
        addNewComponentToRoot ||
        // Set image URL
        (hoverCmp.tag === 'img' && isFile) ||
        (hoverCmp.id !== dragCmpParentId &&
          !hoverCmp.content &&
          !['img', 'vue'].includes(hoverCmp.tag) &&
          !hoverCmp.customSourceId)
      ) {
        dropProps.hoverSelf = true
        dropProps.destinationIndex = hoverCmp.children?.length ?? 0
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
