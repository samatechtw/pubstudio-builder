export type ClickawayCallback = (event: Event) => void

export const createClickawayListener = (
  ignoreElementsSelector: string,
  callback: ClickawayCallback,
) => {
  return (event: Event) => {
    const ignore = Array.from(document.querySelectorAll(ignoreElementsSelector)).some(
      (el: Element) => {
        const eventEl = event.target as Element
        const isTarget = el.contains(eventEl)
        if (isTarget) {
          return true
        } else {
          return !!eventEl.closest(ignoreElementsSelector)
        }
      },
    )
    if (!ignore) {
      return callback(event)
    }
    return null
  }
}
