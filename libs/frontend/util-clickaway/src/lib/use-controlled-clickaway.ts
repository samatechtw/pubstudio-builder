import { onMounted, onUnmounted } from 'vue'
import { IClickaway } from './use-clickaway'

const isMobileDevice = !!document.ontouchstart

const mouseDownEventType = isMobileDevice ? 'touchstart' : 'mousedown'
const mouseUpEventType = isMobileDevice ? 'touchend' : 'mouseup'

export const useControlledClickaway = (
  // Mouseup inside this selector will not trigger the callback
  selector: string,
  callback: (mouseDownEvent: Event | undefined, mouseUpEvent: Event | undefined) => void,
  manual?: boolean,
): IClickaway => {
  /**
   * Nullable because the `mousedown` event of the clicked element could be decorated with `stop` modifier.
   */
  let mouseDownEvent: Event | undefined
  /**
   * Nullable because the `mouseup` event of the clicked element could be decorated with `stop` modifier.
   */
  let mouseUpEvent: Event | undefined

  const onMouseDown = (e: Event) => {
    mouseDownEvent = e
  }

  const onMouseUp = (e: Event) => {
    mouseUpEvent = e
    const mouseDownTarget = mouseDownEvent?.target as Element | undefined
    const clickStartedFromContainer = !!mouseDownTarget?.closest(selector)
    if (!clickStartedFromContainer) {
      callback(mouseDownEvent, mouseUpEvent)
    }
    mouseDownEvent = undefined
    mouseUpEvent = undefined
  }

  const activate = () => {
    document.addEventListener(mouseDownEventType, onMouseDown)
    document.addEventListener(mouseUpEventType, onMouseUp)
  }

  const deactivate = () => {
    document.removeEventListener(mouseDownEventType, onMouseDown)
    document.removeEventListener(mouseUpEventType, onMouseUp)
  }

  onMounted(() => {
    if (!manual) {
      activate()
    }
  })

  onUnmounted(() => {
    deactivate()
  })

  return {
    activate,
    deactivate,
  }
}
