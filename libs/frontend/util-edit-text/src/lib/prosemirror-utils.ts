import { Attrs, Mark, MarkType, ResolvedPos, Schema } from 'prosemirror-model'
import { Command, EditorState, SelectionRange, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const posWithoutSpaces = (range: SelectionRange) => {
  const { $from, $to } = range

  let from = $from.pos
  let to = $to.pos
  const start = $from.nodeAfter
  const end = $to.nodeBefore
  /* eslint-disable @typescript-eslint/no-non-null-assertion */
  const spaceStart = start && start.isText ? /^\s*/.exec(start.text!)![0].length : 0
  const spaceEnd = end && end.isText ? /\s*$/.exec(end.text!)![0].length : 0
  /* eslint-enable @typescript-eslint/no-non-null-assertion */
  if (from + spaceStart < to) {
    from += spaceStart
    to -= spaceEnd
  }
  return { from, to }
}

export const isMarkInSelection = (view: EditorView, mark: MarkType): boolean => {
  const selection = view.state?.selection as TextSelection
  if (!selection || (selection.empty && !selection.$cursor)) {
    return false
  }
  const { $cursor, ranges } = selection
  if ($cursor) {
    return !!mark.isInSet(view.state.storedMarks || $cursor.marks())
  } else {
    return ranges.some((r) => {
      let some = false
      view.state.doc.nodesBetween(r.$from.pos, r.$to.pos, (node) => {
        if (some) return false
        some = !!mark.isInSet(node.marks)
      })
      return some
    })
  }
}

const findElementFromCursor = (
  view: EditorView | undefined,
  $cursor: ResolvedPos,
): Element | undefined => {
  const pos = $cursor.pos - $cursor.textOffset
  const nodeOrElement = view?.nodeDOM(pos) ?? null

  let element: Element | Node | null = nodeOrElement
  while (element && !(element instanceof Element)) {
    element = element.parentElement
  }

  return element ?? undefined
}

// FIXME: this is a workaround for link mark not being found in `mark.isInSet`.
const markInSet = (mark: MarkType, marks: readonly Mark[]): Mark | undefined => {
  const markInSet = mark.isInSet(marks)
  if (markInSet || marks[0]?.type.name === mark.name) {
    return markInSet || marks[0]
  }
  return undefined
}

// Returns a mark and it's corresponding DOM element, if fully encompassed by the selection
export const markSelected = (
  state: EditorState | undefined,
  mark: MarkType,
  view: EditorView | undefined,
): [Mark | undefined, Element | undefined] => {
  const selection = state?.selection as TextSelection
  if (!state || !selection || (selection.empty && !selection.$cursor)) {
    return [undefined, undefined]
  }
  const { $cursor, $head, $anchor } = selection
  let foundMark: Mark | undefined
  if ($cursor) {
    const marks = $cursor.marks()
    foundMark = markInSet(mark, state.storedMarks || marks)
  } else {
    const begin = Math.min($head.pos, $anchor.pos)
    const end = Math.max($head.pos, $anchor.pos)
    const head2 = state.doc.resolve(begin + 1)
    const anchor2 = state.doc.resolve(end - 1)
    const inHead = markInSet(mark, $head.marks()) || markInSet(mark, head2.marks())
    const inAnchor = markInSet(mark, $anchor.marks()) || markInSet(mark, anchor2.marks())
    foundMark = inHead && inAnchor
  }

  if (foundMark) {
    return [foundMark, findElementFromCursor(view, $cursor || selection.$head)]
  }
  return [undefined, undefined]
}

export const firstMarkInSelection = (
  state: EditorState | undefined,
  mark: MarkType,
): Mark | undefined => {
  const selection = state?.selection as TextSelection
  if (!state || !selection || (selection.empty && !selection.$cursor)) {
    return undefined
  }
  const { $cursor, ranges } = selection
  if ($cursor) {
    const marks = $cursor.marks()
    const foundMark = mark.isInSet(state.storedMarks || marks)
    return foundMark
  } else {
    let found: Mark | undefined = undefined
    ranges.some((r) => {
      state.doc.nodesBetween(r.$from.pos, r.$to.pos, (node) => {
        if (found) return false
        found = mark.isInSet(node.marks)
      })
      return [!!found, undefined]
    })
    return found
  }
}

function markApplies(s: EditorState, ranges: readonly SelectionRange[], type: MarkType) {
  for (let i = 0; i < ranges.length; i++) {
    const { $from, $to } = ranges[i]
    let can =
      $from.depth == 0 ? s.doc.inlineContent && s.doc.type.allowsMarkType(type) : false
    s.doc.nodesBetween($from.pos, $to.pos, (node) => {
      if (can) return false
      can = node.inlineContent && node.type.allowsMarkType(type)
    })
    if (can) return true
  }
  return false
}

export const setOrRemoveStyleMark = (
  markType: MarkType,
  prop: string,
  newStyle: string | undefined,
  parentStyle: string | undefined,
): Command => {
  return function (state, dispatch) {
    const attrs = { [prop]: newStyle }
    const { empty, $cursor, ranges } = state.selection as TextSelection
    if ((empty && !$cursor) || !markApplies(state, ranges, markType)) return false
    if (dispatch) {
      // If style is cleared or set to the parent style, remove mark(s)
      const remove = !newStyle || newStyle === parentStyle
      if ($cursor) {
        if (remove) {
          dispatch(state.tr.removeStoredMark(markType))
        } else {
          const markInSet = markType.isInSet(state.storedMarks || $cursor.marks())
          if (markInSet) {
            // If mark exists but style doesn't match, replace it
            if (markInSet.attrs[prop] !== parentStyle) {
              dispatch(state.tr.addStoredMark(markType.create(attrs)))
            }
          } else {
            // If mark does not exist, create it
            dispatch(state.tr.addStoredMark(markType.create(attrs)))
          }
        }
      } else {
        const tr = state.tr
        for (let i = 0; i < ranges.length; i++) {
          const { $from, $to } = ranges[i]
          if (remove) {
            tr.removeMark($from.pos, $to.pos, markType)
          } else {
            const { from, to } = posWithoutSpaces(ranges[i])
            tr.addMark(from, to, markType.create(attrs))
          }
        }
        dispatch(tr.scrollIntoView())
      }
    }
    return true
  }
}

export const replaceMark = (markType: MarkType, attrs: Attrs | null = null): Command => {
  return function (state, dispatch) {
    const { empty, $cursor, ranges } = state.selection as TextSelection
    if ((empty && !$cursor) || !markApplies(state, ranges, markType)) return false
    if (dispatch) {
      if ($cursor) {
        dispatch(state.tr.addStoredMark(markType.create(attrs)))
      } else {
        const tr = state.tr

        for (let i = 0; i < ranges.length; i++) {
          const { from, to } = posWithoutSpaces(ranges[i])
          tr.addMark(from, to, markType.create(attrs))
        }
        dispatch(tr.scrollIntoView())
      }
    }
    return true
  }
}

export const createLinkNode = (
  schema: Schema,
  text: string,
  href: string,
  target: string | undefined,
) => {
  const attrs = {
    title: href,
    href,
    target: target ?? null,
  }
  return schema.text(text, [schema.mark('link', attrs), schema.mark('u')])
}
