import { setBuildSubmenu } from '@pubstudio/frontend/data-access-command'
import {
  addBuiltinComponent,
  addCustomComponent,
  addDroppedComponent,
  moveAbsoluteComponent,
  moveComponent,
} from '@pubstudio/frontend/feature-build'
import { setBuildOverlays } from '@pubstudio/frontend/feature-build-overlay'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { getActivePage } from '@pubstudio/frontend/feature-site-store'
import {
  BuilderDragDataType,
  IDraggedComponentAddData,
} from '@pubstudio/frontend/type-builder'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { resolvedComponentStyle } from '@pubstudio/frontend/util-component'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import {
  BuildSubmenu,
  Css,
  CssPseudoClass,
  IComponent,
  ISite,
  Tag,
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

export interface IDropComponentData {
  id: string
}

export interface IUseDragDropProps {
  site: ISite
  componentId: string | undefined
  getParentId: () => string | undefined
  getComponentIndex: () => number
  addData?: IDraggedComponentAddData
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
      hoveredComponent.id === draggedComponent?.id ||
      hoveredComponent.customSourceId
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

      // Hide overlays
      document.body.classList.add('dragging-mode')

      // Workaround for Chrome calling `dragend` immediately after `dragstart`
      setTimeout(() => {
        const clickOffset: XYCoord = {
          x: e.clientX,
          y: e.clientY,
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
      const component = resolveComponent(site.context, componentId)
      if (isParent || component?.tag === Tag.Img) {
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
      builderContext.buildDndState.value = {
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
          isFile,
          dragSrc: dragSource.value,
          hoverCmpIndex: getComponentIndex(),
          hoverCmp: component,
          elementRef: elementRef.value,
          verticalOnly,
        })
        updateRuntimeContext(component.id)
      } else {
        // Reset `buildDndState` to avoid the hover overlay from being stuck.
        // This handles the case where the dragged component is hovered on its children.
        builderContext.buildDndState.value = undefined
      }
    } else {
      // Reset `buildDndState` to avoid the hover overlay from being stuck.
      // This handles the case where the dragged component is hovered on itself.
      builderContext.buildDndState.value = undefined
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
          const { type: addDataType } = dragSource.value.addData
          if (addDataType === BuilderDragDataType.BuiltinComponent) {
            addBuiltinComponent(site, {
              id: dragSource.value.addData.id,
              parentId: addParentId,
              parentIndex: dropProps.value.destinationIndex,
            })
            return
          } else if (addDataType === BuilderDragDataType.CustomComponent) {
            addCustomComponent(site, {
              id: dragSource.value.addData.id,
              parentId: addParentId,
              parentIndex: dropProps.value.destinationIndex,
            })
          } else if (
            addDataType === BuilderDragDataType.ImageAsset ||
            addDataType === BuilderDragDataType.LinkAsset
          ) {
            addDroppedComponent(site, addDataType, {
              id: dragSource.value.addData.id,
              parentId: addParentId,
              parentIndex: dropProps.value.destinationIndex,
              content: dragSource.value.addData.content,
            })
          } else {
            throw new Error(`UNKNOWN_ADD_DATA_TYPE_${addDataType}`)
          }
        }
      } else if (
        sourceComponent &&
        parent &&
        droppedSameParent() &&
        position === 'absolute'
      ) {
        const left = e.clientX - clickOffset.x
        const top = e.clientY - clickOffset.y
        const el = getDraggedElement?.(e) ?? document.getElementById(componentId)
        moveAbsoluteComponent(site, el, sourceComponent, left, top)
      } else if (component && canDrop()) {
        const drop = onDrop(component, dragSource.value, dropProps.value)
        if (drop) {
          moveComponent(site, drop.from, drop.to)
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
    // It's difficult/inefficient to use reactivity in BuildDndOverlay.vue to update the
    // selected component outline, so we do it here.
    setBuildOverlays(site.editor, getActivePage(site))
  }

  const dragend = (e: DragEvent) => {
    e.stopPropagation()
    hovering.value = false
    dropProps.value = defaultDropProps()
    dragSource.value = undefined
    dragendOption?.()
    builderContext.buildDndState.value = undefined
    document.body.classList.remove('dragging-mode')
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
