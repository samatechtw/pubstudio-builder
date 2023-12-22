import { Attrs, Mark, MarkType, ResolvedPos } from 'prosemirror-model'
import { Command, EditorState, SelectionRange, TextSelection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Schema } from 'prosemirror-model'

const posWithoutSpaces = (range: SelectionRange) => {
  const { $from, $to } = range

  let from = $from.pos
  let to = $to.pos
  const start = $from.nodeAfter
  const end = $to.nodeBefore
  const spaceStart = start && start.isText ? /^\s*/.exec(start.text!)![0].length : 0
  const spaceEnd = end && end.isText ? /\s*$/.exec(end.text!)![0].length : 0
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
      let some: boolean = false
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

export const firstMarkInSelection = (
  state: EditorState | undefined,
  mark: MarkType,
  view?: EditorView,
): [Mark | undefined, Element | undefined] => {
  const selection = state?.selection as TextSelection
  if (!state || !selection || (selection.empty && !selection.$cursor)) {
    return [undefined, undefined]
  }
  const { $cursor, ranges } = selection
  if ($cursor) {
    const marks = $cursor.marks()
    const markInSet = mark.isInSet(state.storedMarks || marks)
    if (markInSet) {
      return [markInSet, findElementFromCursor(view, $cursor)]
    } else {
      // FIXME: this is a workaround for link mark not being found in `mark.isInSet`.
      const firstMark = marks[0]
      if (firstMark?.type.name === mark.name) {
        return [firstMark, findElementFromCursor(view, $cursor)]
      } else {
        return [undefined, undefined]
      }
    }
  } else {
    let found: Mark | undefined = undefined
    ranges.some((r) => {
      state.doc.nodesBetween(r.$from.pos, r.$to.pos, (node) => {
        if (found) return false
        found = mark.isInSet(node.marks)
      })
      return [!!found, undefined]
    })
    return [found, undefined]
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

export const createLinkNode = (schema: Schema, href: string, target?: string) => {
  const attrs = {
    title: href,
    href: href,
    target: target ?? null,
  }
  return schema.text(href, [schema.mark('link', attrs), schema.mark('u')])
}
