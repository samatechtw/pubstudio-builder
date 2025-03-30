export const debounce = <A = unknown>(
  func: (args: A) => void,
  wait: number,
  maxWait?: number,
) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  let waitStart: number | undefined
  let lastCall = 0
  return function (args: A): void {
    const now = Date.now()
    if (maxWait) {
      if (!waitStart) {
        waitStart = now
      }
      if (now - waitStart >= maxWait) {
        if (timeout) {
          clearTimeout(timeout)
        }
        timeout = setTimeout(() => {
          timeout = undefined
          waitStart = undefined
        }, wait)
        func(args)
        waitStart = now
        lastCall = Date.now()
        return
      }
    }

    const callNow = !timeout && now - lastCall >= wait
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(args)
      timeout = undefined
      waitStart = undefined
      lastCall = Date.now()
    }, wait)

    if (callNow) {
      func(args)
    }
  }
}
