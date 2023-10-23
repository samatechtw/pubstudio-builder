export const debounce = <A = unknown>(func: (args: A) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | undefined
  return function (args: A): void {
    const callNow = !timeout
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(args)
      timeout = undefined
    }, wait)

    if (callNow) {
      func(args)
    }
  }
}
