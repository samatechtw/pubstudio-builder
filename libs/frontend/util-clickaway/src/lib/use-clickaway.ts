import { onMounted, onUnmounted } from 'vue'
import { ClickawayCallback } from './create-clickaway-listener'
import { createClickawayListener } from './create-clickaway-listener'

const clickEventType = document.ontouchstart !== null ? 'click' : 'touchend'

export interface IClickaway {
  activate: () => void
  deactivate: () => void
}

export const useClickaway = (
  ignoreElementsSelector: string,
  callback: ClickawayCallback,
  manual = false,
): IClickaway => {
  let listener: EventListener

  const activate = () => {
    document.addEventListener(clickEventType, listener, false)
  }

  const deactivate = () => {
    if (listener) {
      document.removeEventListener(clickEventType, listener, false)
    }
  }

  const mounted = () => {
    listener = createClickawayListener(ignoreElementsSelector, callback)
    if (!manual) {
      activate()
    }
  }

  onMounted(() => {
    mounted()
  })
  onUnmounted(() => {
    deactivate()
  })

  return { activate, deactivate }
}
