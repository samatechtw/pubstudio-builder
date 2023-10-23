// Types instead of interfaces to work with HistoryStateValue type

// Scroll position. Not all browsers support `behavior`.
export type ScrollPositionCoordinates = {
  behavior?: ScrollOptions['behavior']
  left?: number
  top?: number
}

export type _ScrollPositionNormalized = {
  behavior?: ScrollOptions['behavior']
  left: number
  top: number
}

export interface ScrollPositionElement extends ScrollToOptions {
  // A valid CSS selector
  el: string | Element
}

export type ScrollPosition = ScrollPositionCoordinates | ScrollPositionElement

function getElementPosition(
  el: Element,
  offset: ScrollPositionCoordinates,
): _ScrollPositionNormalized {
  const docRect = document.documentElement.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()

  return {
    behavior: offset.behavior,
    left: elRect.left - docRect.left - (offset.left || 0),
    top: elRect.top - docRect.top - (offset.top || 0),
  }
}

export const computeScrollPosition = (
  scrollRoot: Element | null | undefined,
): _ScrollPositionNormalized => {
  return scrollRoot
    ? {
        left: scrollRoot.scrollLeft,
        top: scrollRoot.scrollTop,
      }
    : {
        left: window.scrollX,
        top: window.scrollY,
      }
}

export async function waitForRender(
  el: Element | null | undefined,
  timeout: number,
): Promise<ScrollPosition | void> {
  if (!el) {
    return
  }
  const startTime = Date.now()
  let prevHeight = el.scrollHeight
  return new Promise((resolve, _reject) => {
    const interval = setInterval(() => {
      const height = el.scrollHeight
      if (height > prevHeight) {
        return resolve({ el })
      }
      prevHeight = height
      if (Date.now() - startTime > timeout) {
        clearInterval(interval)
      }
    }, 30)
  })
}

export function scrollToPosition(
  position: ScrollPosition,
  scrollRoot: Element | null | undefined,
): void {
  let scrollToOptions: ScrollPositionCoordinates

  if ('el' in position) {
    const positionEl = position.el

    const el =
      typeof positionEl === 'string' ? document.querySelector(positionEl) : positionEl

    if (!el) {
      console.log(`No el with selector: ${position.el} in scrollBehavior.`)
      return
    }
    scrollToOptions = getElementPosition(el, position)
  } else {
    scrollToOptions = position
  }

  if (scrollRoot) {
    scrollRoot.scroll(scrollToOptions)
  } else {
    window.scrollTo(scrollToOptions)
  }
}

export function getScrollKey(path: string): string {
  // TODO -- Add back if we need to differentiate between the same paths on the history stack
  // const position: number = history.state ? history.state.position - delta : -1
  return path
}

export const scrollPositions = new Map<string, _ScrollPositionNormalized>()

export function saveScrollPosition(
  key: string,
  scrollPosition: _ScrollPositionNormalized,
) {
  scrollPositions.set(key, scrollPosition)
}

export function getSavedScrollPosition(key: string) {
  const scroll = scrollPositions.get(key)
  // consume it so it's not used again
  scrollPositions.delete(key)
  return scroll
}
