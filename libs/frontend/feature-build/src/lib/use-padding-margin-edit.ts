import { Css } from '@pubstudio/shared/type-site'
import {
  CssArr,
  CssValue,
  parseSides,
  serializeSides,
} from '@pubstudio/shared/util-parse'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { useToolbar } from './use-toolbar'

const SCALE_X = 0.5
const SCALE_Y = 0.5

export interface IUsePaddingMarginEdit {
  dragging: Ref<IDragData | undefined>
  disableClose: Ref<boolean>
  dragClass: ComputedRef<string | undefined>
  padding: ComputedRef<CssArr>
  margin: ComputedRef<CssArr>
  editValueData: Ref<IEditValueData | undefined>
  editMousedown: (e: MouseEvent, css: Css, side: DragSide) => void
  editValue: () => void
  setValue: (value: CssValue) => void
  startDrag: (e: MouseEvent, css: Css, side: DragSide) => void
  drag: (e: MouseEvent) => void
  stopDrag: (e?: MouseEvent) => void
}

export enum DragSide {
  Top,
  Right,
  Bottom,
  Left,
}

export interface IDragData {
  css: Css
  side: DragSide
  startX: number
  startY: number
  startCss: CssArr
  firstMove: boolean
  prevShift: boolean
}

export interface IEditValueData {
  css: Css
  side: DragSide
  value: ComputedRef<CssValue>
  inputValue: CssValue
}

const { getStyleValue, setStyle } = useToolbar()

const dragging = ref<IDragData>()
// Used to disable closing the menu/container on mouseup
// It's necessary because `dragging` is set to undefined before the menu clickaway is triggered
const disableClose = ref(false)

// Set on padding/margin value mousedown. Used to support both dragging and clicking
// on the value, otherwise the click is consumed by @click
const maybeEdit = ref<{ css: Css; side: DragSide }>()
const editValueData = ref<IEditValueData>()

// Class for setting global cursor while dragging
const dragClass = computed(() => {
  if (dragging.value) {
    const side = dragging.value.side
    if (side === DragSide.Left || side === DragSide.Right) {
      return 'drag-ew'
    } else if (side === DragSide.Top || side === DragSide.Bottom) {
      return 'drag-ns'
    }
  }
  return undefined
})

const valueAsNumber = (value: CssValue): number => {
  if (value === 'unset' || value == 'auto') {
    return 0
  }
  return value
}

const startDrag = (e: MouseEvent, css: Css, side: DragSide) => {
  dragging.value = {
    startX: e.clientX,
    startY: e.clientY,
    css,
    side,
    startCss: parseSides(getStyleValue(css)),
    firstMove: true,
    prevShift: false,
  }
  disableClose.value = true
}

const drag = (e: MouseEvent) => {
  // Steal from `editMousedown`
  if (maybeEdit.value) {
    startDrag(e, maybeEdit.value.css, maybeEdit.value.side)
    maybeEdit.value = undefined
  }
  if (dragging.value) {
    const { css, side, startX, startY, startCss, firstMove, prevShift } = dragging.value

    const setCss = (v: number) => {
      if (dragging.value) {
        const value = css === Css.Margin ? v : v * -1
        const newCss: CssArr = [...startCss]
        if (e.shiftKey) {
          newCss.fill(valueAsNumber(startCss[side]) + value)
        } else {
          newCss[side] = valueAsNumber(newCss[side]) + value
        }
        if (e.shiftKey !== prevShift) {
          newCss.fill(valueAsNumber(startCss[side]) + value)
          dragging.value.startCss = newCss
          dragging.value.startX = e.clientX
          dragging.value.startY = e.clientY
        }
        const replace = !firstMove
        setStyle(css, serializeSides(newCss), replace)
      }
    }

    if (side === DragSide.Right) {
      setCss(Math.round((startX - e.clientX) * SCALE_X))
    } else if (side === DragSide.Left) {
      setCss(Math.round((e.clientX - startX) * SCALE_X))
    } else if (side === DragSide.Bottom) {
      setCss(Math.round((startY - e.clientY) * SCALE_Y))
    } else if (side === DragSide.Top) {
      setCss(Math.round((e.clientY - startY) * SCALE_Y))
    }
    dragging.value.firstMove = false
    dragging.value.prevShift = e.shiftKey
  }
}

const editValue = () => {
  if (maybeEdit.value) {
    const { css, side } = maybeEdit.value
    const value = computed(() => parseSides(getStyleValue(css))[side])
    editValueData.value = { css, side, value, inputValue: value.value }
    maybeEdit.value = undefined
  }
}

const stopDrag = (_e?: MouseEvent) => {
  setTimeout(() => {
    disableClose.value = false
  }, 1)
  dragging.value = undefined
}

export const usePaddingMarginEdit = (): IUsePaddingMarginEdit => {
  const padding = computed(() => {
    return parseSides(getStyleValue(Css.Padding))
  })
  const margin = computed(() => {
    return parseSides(getStyleValue(Css.Margin))
  })

  const setValue = (value: CssValue) => {
    if (editValueData.value) {
      const { css, side } = editValueData.value
      const values = parseSides(getStyleValue(css))
      values[side] = value
      setStyle(css, serializeSides(values))
      editValueData.value = undefined
    }
  }

  const editMousedown = (e: MouseEvent, css: Css, side: DragSide) => {
    maybeEdit.value = { css, side }
    e.stopPropagation()
  }

  return {
    dragging,
    disableClose,
    dragClass,
    padding,
    margin,
    editValueData,
    editMousedown,
    editValue,
    setValue,
    startDrag,
    drag,
    stopDrag,
  }
}
