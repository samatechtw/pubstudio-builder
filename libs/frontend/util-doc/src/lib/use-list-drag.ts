import { Ref, ref } from 'vue'

export interface IUseListDrag {
  draggingIndex: Ref<number | undefined>
  newPos: Ref<number | undefined>
  dragListPreview<T>(list: T[]): T[]
  dragstart(e: DragEvent, index: number): void
  drag(e: DragEvent): void
  dragenter(e: DragEvent, index: number): void
  dragover(e: DragEvent): void
  dragleave(e: DragEvent): void
  drop(e: DragEvent, index: number): void
  dragend(e: DragEvent): void
}

export interface IUseListDragOptions {
  dataIdentifier: string
  // Return an element to use as the drag image. Defaults to dragstart target
  getDragElement?: (e: DragEvent, index: number) => HTMLElement | null | undefined
  onDrop: (e: DragEvent, draggingIndex: number, targetIndex: number) => void
}

export const useListDrag = (options: IUseListDragOptions): IUseListDrag => {
  const { dataIdentifier, getDragElement, onDrop } = options
  const draggingIndex = ref()
  const newPos = ref()

  const dragListPreview = <T>(list: T[]): T[] => {
    if (draggingIndex.value !== undefined && newPos.value !== undefined) {
      const dragged = list.splice(draggingIndex.value, 1)
      if (dragged[0]) {
        list.splice(newPos.value, 0, dragged[0])
      }
    }
    return list
  }

  const dragstart = (e: DragEvent, index: number) => {
    e.stopPropagation()
    newPos.value = undefined
    if (e.dataTransfer) {
      const el = getDragElement?.(e, index)
      const bound = el?.getBoundingClientRect()
      // Workaround for Chrome calling `dragend` immediately after `dragstart`
      setTimeout(() => {
        draggingIndex.value = index
      }, 1)
      e.dataTransfer.setData(dataIdentifier, index.toString())
      e.dataTransfer.effectAllowed = 'move'
      // Set the drag image to the list parent
      if (el) {
        e.dataTransfer.setDragImage(
          el,
          e.clientX - (bound?.left ?? 0),
          e.clientY - (bound?.top ?? 0),
        )
      }
    }
  }

  const drag = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    // Drag updates in `dragover`
  }

  const dragenter = (e: DragEvent, index: number) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.dataTransfer) {
      newPos.value = index
    }
  }

  const dragover = (e: DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.dataTransfer) {
      const isStyle = e.dataTransfer.types.includes(dataIdentifier)
      if (isStyle) {
        e.preventDefault()
      }
    }
  }

  const dragleave = (e: DragEvent) => {
    e.stopPropagation()
  }

  const drop = (e: DragEvent, index: number) => {
    e.stopPropagation()
    if (draggingIndex.value !== undefined) {
      onDrop(e, draggingIndex.value, index)
    }
    newPos.value = undefined
    draggingIndex.value = undefined
  }

  const dragend = (e: DragEvent) => {
    e.stopPropagation()
    newPos.value = undefined
    draggingIndex.value = undefined
  }

  return {
    draggingIndex,
    newPos,
    dragListPreview,
    dragstart,
    drag,
    dragenter,
    dragover,
    dragleave,
    drop,
    dragend,
  }
}
