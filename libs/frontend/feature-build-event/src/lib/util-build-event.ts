// Hack to let modals handle ESC without triggering editor events or stopping propagation
let cancelNextEsc = false

export const setCancelNextEsc = (cancel: boolean) => {
  cancelNextEsc = cancel
}

export const prosemirrorActive = (e: KeyboardEvent): boolean => {
  return e.target instanceof HTMLElement && e.target.classList.contains('ProseMirror')
}

export const hotkeysDisabled = (e: KeyboardEvent) => {
  if (cancelNextEsc) {
    setCancelNextEsc(false)
    return true
  }
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
    // Key events on readonly inputs should still trigger editor events
    return !e.target.hasAttribute('readonly')
  }
  return prosemirrorActive(e)
}
