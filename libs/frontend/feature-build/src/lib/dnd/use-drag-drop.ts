import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-build'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { isDynamicComponent } from '@pubstudio/frontend/util-ids'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import {
  Css,
  CssPseudoClass,
  IComponent,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { useBuild } from '../use-build'
import { IDndState, IDraggedComponent, IDroppedFile, IDropProps } from './builder-dnd'
import { onDrag, onDrop } from './drag-drop'
import { XYCoord } from './row-layout'

export interface IUseDragDrop {
  dndState: ComputedRef<IDndState | undefined>
  elementRef: Ref<HTMLElement | undefined>
  droppedFile: Ref<IDroppedFile | undefined>
  dragstart: (e: DragEvent) => void
  drag: (e: DragEvent) => void
  dragenter: (e: DragEvent) => void
  dragover: (e: DragEvent) => void
  dragleave: (e: DragEvent) => void
  drop: (e: DragEvent) => void
  dragend: (e: DragEvent) => void
}

export interface IUseDragDropData {
  droppedFile: Ref<IDroppedFile | undefined>
}

export interface IUseDragDropProps {
  context: ISiteContext
  componentId: string | undefined
  getParentId: () => string | undefined
  getComponentIndex: () => number
  addData?: IAddComponentData
  // A parent of the target component is being dragged
  isParent?: boolean
  verticalOnly?: boolean
  getDraggedElement?: (e: DragEvent) => HTMLElement | null
}

const COMPONENT_TYPE = 'text/component-id'

const dragSource = ref<IDraggedComponent>()
const droppedFile = ref<IDroppedFile>()

const defaultDropProps = (): IDropProps => {
  return {
    hoverSelf: false,
    hoverTop: false,
    hoverRight: false,
    hoverBottom: false,
    hoverLeft: false,
    destinationIndex: 0,
  }
}

// Searches up the component tree for the first non-dynamic component
// Dynamic components cannot be dragged at this time
export const findNonDynamic = (component: IComponent): IComponent | undefined => {
  let target: IComponent | undefined = component
  while (target && isDynamicComponent(target.id)) {
    target = target.parent
  }
  return target
}

// Useful for using DragDrop state without needing the callbacks
export const useDragDropData = (): IUseDragDropData => {
  return {
    droppedFile,
  }
}

export const useDragDrop = (props: IUseDragDropProps): IUseDragDrop => {
  const {
    context,
    componentId,
    getParentId,
    getComponentIndex,
    isParent,
    addData,
    verticalOnly,
    getDraggedElement,
  } = props
  const { moveComponent, moveAbsoluteComponent, addComponentData } = useBuild()
  const hovering = ref(false)

  const elementRef: Ref<HTMLElement | undefined> = ref()
  const dropProps = ref<IDropProps>(defaultDropProps())

  const droppedSameParent = (): boolean => {
    const parentId = dragSource.value?.parentId
    return !!parentId && parentId === componentId
  }

  const dndState = computed<IDndState | undefined>(() => {
    return dragSource.value
      ? {
          dragging: dragSource.value.componentId === componentId,
          hovering: hovering.value,
          ...dropProps.value,
        }
      : undefined
  })

  const isAncestorOf = (ancestor: IComponent, component: IComponent): boolean => {
    let c: IComponent | undefined = component
    while (c) {
      if (c.id === ancestor.id) {
        return true
      }
      c = c.parent
    }
    return false
  }

  const canDrop = (): boolean => {
    if (dragSource.value?.addData) {
      return true
    }

    const hoveredComponent = resolveComponent(context, componentId)
    const draggedComponent = resolveComponent(context, dragSource.value?.componentId)
    if (
      !hoveredComponent ||
      !draggedComponent ||
      hoveredComponent.id === draggedComponent.id
    ) {
      return false
    }
    return (
      // Excludes components which should not have components as children, such as text and img
      (!dndState.value?.hoverSelf || hoveredComponent.content === undefined) &&
      !isAncestorOf(draggedComponent, hoveredComponent)
    )
  }

  const dragstart = (e: DragEvent) => {
    e.stopPropagation()
    if (componentId && e.dataTransfer) {
      const el = getDraggedElement?.(e) ?? document.getElementById(componentId)
      const bound = el?.getBoundingClientRect()
      // Workaround for Chrome calling `dragend` immediately after `dragstart`
      setTimeout(() => {
        const clickOffset: XYCoord = {
          x: e.clientX - (bound?.left ?? 0),
          y: e.clientY - (bound?.top ?? 0),
        }
        dragSource.value = {
          componentId,
          parentId: getParentId(),
          index: getComponentIndex(),
          clickOffset,
          addData,
        }
      }, 1)
      e.dataTransfer.setData(COMPONENT_TYPE, componentId)
      e.dataTransfer.effectAllowed = 'move'
      // If a parent of the original component is being dragged,
      // we need to manually set the drag image
      if (isParent) {
        if (el) {
          e.dataTransfer.setDragImage(
            el,
            e.clientX - (bound?.left ?? 0),
            e.clientY - (bound?.top ?? 0),
          )
        }
      }
    }
  }

  const drag = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    // Drag updates in `dragover`
  }

  const dragenter = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (dragSource.value === undefined) {
      // External file is being dragged
      // TODO -- is there a better way to detect this?
      hovering.value = true
    } else if (
      e.dataTransfer &&
      canDrop() &&
      dragSource.value?.componentId !== componentId
    ) {
      hovering.value = true
    }
  }

  const dragover = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const component = resolveComponent(context, componentId)
    if (component && e.dataTransfer && dragSource.value?.componentId !== componentId) {
      const isComponent = e.dataTransfer.types.includes(COMPONENT_TYPE)
      if (isComponent && dragSource.value && canDrop()) {
        e.preventDefault()
        dropProps.value = onDrag({
          e,
          context,
          dragSrc: dragSource.value,
          hoverCmpIndex: getComponentIndex(),
          hoverCmp: component,
          elementRef: elementRef.value,
          verticalOnly,
        })
      }
    }
  }

  const dragleave = (e: DragEvent) => {
    e.stopPropagation()
    hovering.value = false
    dropProps.value = defaultDropProps()
  }

  const drop = (e: DragEvent) => {
    e.stopPropagation()
    if (!componentId) {
      return
    }
    const file = e.dataTransfer?.files[0]
    if (dragSource.value === undefined && file) {
      // External file drag
      e.preventDefault()
      droppedFile.value = {
        componentId,
        index: dropProps.value.destinationIndex,
        file,
      }
    } else if (dragSource.value) {
      // Component drag from builder or component tree
      const { parentId: dragSourceParentId, clickOffset } = dragSource.value
      const sourceComponent = resolveComponent(context, dragSource.value.componentId)
      const component = resolveComponent(context, componentId)
      const position = resolvedComponentStyle(
        context,
        sourceComponent,
        CssPseudoClass.Default,
        Css.Position,
        activeBreakpoint.value.id,
      )
      const parent = document.getElementById(dragSourceParentId ?? '')
      if (dragSource.value.addData) {
        const addParentId = dndState.value?.hoverSelf ? componentId : getParentId()
        if (addParentId) {
          addComponentData({
            ...dragSource.value.addData,
            parentId: addParentId,
            parentIndex: dropProps.value.destinationIndex,
          })
        }
      } else if (
        sourceComponent &&
        parent &&
        droppedSameParent() &&
        position === 'absolute'
      ) {
        const bounds = parent.getBoundingClientRect()
        const left = `${e.clientX - bounds.left - clickOffset.x}px`
        const top = `${e.clientY - bounds.top - clickOffset.y}px`
        moveAbsoluteComponent(sourceComponent, left, top)
      } else if (component && canDrop()) {
        const drop = onDrop(component, dragSource.value, dropProps.value)
        if (drop) {
          moveComponent(drop.from, drop.to)
        }
      }
    }
    dragSource.value = undefined
    dropProps.value = defaultDropProps()
    hovering.value = false
  }

  const dragend = (e: DragEvent) => {
    e.stopPropagation()
    hovering.value = false
    dropProps.value = defaultDropProps()
    dragSource.value = undefined
  }

  return {
    dndState,
    elementRef,
    droppedFile,
    dragstart,
    drag,
    dragenter,
    dragover,
    dragleave,
    drop,
    dragend,
  }
}
