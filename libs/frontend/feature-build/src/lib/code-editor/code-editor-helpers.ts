import { Command, EditorState, TextSelection, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

type DispatchFn = ((tr: Transaction) => void) | undefined

type OffsetFn = (text: string, offset: number) => number

const goToPosOffset = (
  state: EditorState,
  dispatch: DispatchFn,
  getOffset: OffsetFn,
): boolean => {
  const { $from } = state.selection
  if ($from.parent.type.name !== 'code_block') {
    return false
  }
  const text = $from.parent.textContent
  const offset = $from.parentOffset

  const newPos = $from.start() + getOffset(text, offset)

  if (dispatch) {
    const tr = state.tr.setSelection(TextSelection.create(state.doc, newPos))
    dispatch(tr)
  }
  return true
}

// Jump to start of the current line inside a code_block
export const goToLineStart: Command = (state, dispatch) => {
  const getOffset: OffsetFn = (text, offset) => {
    // find the previous newline before the cursor
    const prevNl = text.lastIndexOf('\n', offset - 1)
    return prevNl < 0 ? 0 : prevNl + 1
  }
  return goToPosOffset(state, dispatch, getOffset)
}

// Jump to end of the current line inside a code_block
export const goToLineEnd: Command = (state, dispatch) => {
  const getOffset: OffsetFn = (text, offset) => {
    // find the next newline after the cursor
    const nextNl = text.indexOf('\n', offset)
    return nextNl < 0 ? text.length : nextNl
  }
  return goToPosOffset(state, dispatch, getOffset)
}

// Browser intercepts Ctrl+a/e, so we need to hook into keydown to make it work.
// Otherwise, the native behavior jumps to the start/end of the whole block.
export const codeDomEventHandlers = {
  keydown(view: EditorView, event: KeyboardEvent) {
    // only intercept plain Ctrl-A/E (no Cmd/Meta, Alt, or Shift)
    if (
      event.key === 'a' &&
      event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey
    ) {
      event.preventDefault()
      goToLineStart(view.state, view.dispatch)
      return true
    }
    if (
      event.key === 'e' &&
      event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      !event.shiftKey
    ) {
      event.preventDefault()
      goToLineEnd(view.state, view.dispatch)
      return true
    }
    return false
  },
  // Disable OS behavior that inserts a period after pressing two spaces.
  beforeinput(view: EditorView, event: InputEvent) {
    const block = view.state.schema.nodes.code_block
    if (
      event.inputType === 'insertText' &&
      event.data === '. ' &&
      view.state.selection.$from.parent.type === block
    ) {
      const { $from } = view.state.selection
      event.preventDefault()
      view.dispatch(view.state.tr.insertText(' ', $from.pos, $from.pos).scrollIntoView())
      return true
    }
    return false
  },
}
