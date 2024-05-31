// Hack to let modals handle ESC without triggering editor events or stopping propagation
let cancelNextEsc = false

export const setCancelNextEsc = (cancel: boolean) => {
  cancelNextEsc = cancel
}

export const hotkeysDisabled = (e: KeyboardEvent) => {
  if (cancelNextEsc) {
    setCancelNextEsc(false)
    return true
  }
  return (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement ||
    (e.target instanceof HTMLElement && e.target.classList.contains('ProseMirror'))
  )
}
