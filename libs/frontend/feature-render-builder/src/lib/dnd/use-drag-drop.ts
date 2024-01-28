import { useBuild } from '@pubstudio/frontend/feature-build'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { setBuildSubmenu } from '@pubstudio/frontend/util-command'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-component'
import { isDynamicComponent } from '@pubstudio/frontend/util-ids'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { IAddComponentData } from '@pubstudio/shared/type-command-data'
import {
  BuildSubmenu,
  Css,
  CssPseudoClass,
  IComponent,
  ISite,
} from '@pubstudio/shared/type-site'
import { computed, ComputedRef, Ref, ref } from 'vue'
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
  site: ISite
  componentId: string | undefined
  getParentId: () => string | undefined
  getComponentIndex: () => number
  addData?: IAddComponentData
  // A parent of the target component is being dragged
  isParent?: boolean
  verticalOnly?: boolean
  getDraggedElement?: (e: DragEvent) => HTMLElement | null
  dragleave?: () => void
  dragend?: () => void
  drop?: () => void
}

const COMPONENT_TYPE = 'text/component-id'
const FILES_TYPE = 'Files'
const VALID_TYPES = ['image/jpg', 'image/jpeg', 'image/png']

export const dragSource = ref<IDraggedComponent>()
const droppedFile = ref<IDroppedFile>()

export const defaultDropProps = (): IDropProps => {
  return {
    hoverSelf: false,
    hoverTop: false,
    hoverRight: false,
    hoverBottom: false,
    hoverLeft: false,
    destinationIndex: -1,
    parentIsRow: false,
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
    site,
    componentId,
    getParentId,
    getComponentIndex,
    isParent,
    addData,
    verticalOnly,
    getDraggedElement,
    dragleave: dragleaveOption,
    dragend: dragendOption,
    drop: dropOption,
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

  const isAncestorOf = (
    ancestor: IComponent | undefined,
    component: IComponent,
  ): boolean => {
    let c: IComponent | undefined = component
    if (!ancestor) {
      return false
    }
    while (c) {
      if (c.id === ancestor.id) {
        return true
      }
      c = c.parent
    }
    return false
  }

  const canDrop = (srcIsFile?: boolean): boolean => {
    if (dragSource.value?.addData) {
      return true
    }

    const hoveredComponent = resolveComponent(site.context, componentId)
    const draggedComponent = resolveComponent(site.context, dragSource.value?.componentId)
    if (
      !hoveredComponent ||
      (!draggedComponent && !srcIsFile) ||
      hoveredComponent.id === draggedComponent?.id
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

  const updateRuntimeContext = (hoverCmpId: string | undefined) => {
    const drop = dropProps.value
    if (
      hoverCmpId &&
      (drop.hoverSelf ||
        drop.hoverTop ||
        drop.hoverRight ||
        drop.hoverBottom ||
        drop.hoverLeft)
    ) {
      runtimeContext.buildDndState.value = {
        hoverSelf: drop.hoverSelf,
        hoverTop: drop.hoverTop,
        hoverRight: drop.hoverRight,
        hoverBottom: drop.hoverBottom,
        hoverLeft: drop.hoverLeft,
        hoverCmpId,
        hoverCmpParentIsRow: drop.parentIsRow,
      }
    }
  }

  const dragover = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const component = resolveComponent(site.context, componentId)
    if (component && e.dataTransfer && dragSource.value?.componentId !== componentId) {
      const isFile = e.dataTransfer.types.includes(FILES_TYPE)
      const srcValid = e.dataTransfer.types.includes(COMPONENT_TYPE) || isFile

      if (srcValid && canDrop(isFile)) {
        e.preventDefault()
        dropProps.value = onDrag({
          e,
          site,
          dragSrc: dragSource.value,
          hoverCmpIndex: getComponentIndex(),
          hoverCmp: component,
          elementRef: elementRef.value,
          verticalOnly,
        })
        updateRuntimeContext(component.id)
      }
    }
  }

  const dragleave = (e: DragEvent) => {
    e.stopPropagation()
    hovering.value = false
    dropProps.value = defaultDropProps()
    dragleaveOption?.()
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
      const sourceComponent = resolveComponent(site.context, dragSource.value.componentId)
      const component = resolveComponent(site.context, componentId)
      const position = resolvedComponentStyle(
        site.context,
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

    if (site.editor?.buildSubmenu === BuildSubmenu.New && dragSource.value?.addData) {
      // Hide new component menu when a new component is dropped
      setBuildSubmenu(site.editor, undefined)
    }

    dragSource.value = undefined
    dropProps.value = defaultDropProps()
    hovering.value = false
    dropOption?.()
  }

  const dragend = (e: DragEvent) => {
    e.stopPropagation()
    hovering.value = false
    dropProps.value = defaultDropProps()
    dragSource.value = undefined
    dragendOption?.()
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
