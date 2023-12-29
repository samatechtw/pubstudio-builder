import { Node, Schema, ResolvedPos } from 'prosemirror-model'
import { Command, EditorState, TextSelection, Transaction } from 'prosemirror-state'
import { createLinkNode } from './prosemirror-utils'
import {
  baseKeymap,
  chainCommands,
  createParagraphNear,
  liftEmptyBlock,
  splitBlock,
} from './base-keymap'

export const urlRegex = () =>
  /(https?:\/\/(www\.)?)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?&/=]*)/g

export const textToLinkKeymap = (schema: Schema) => {
  const keys: Record<string, Command> = {}

  keys.Space = textToLinkOnSpace(schema)
  keys.Enter = textToLinkOnEnter(schema)

  return keys
}

const textToLinkOnSpace = (schema: Schema): Command => {
  return (state, dispatch) => {
    const { $cursor } = state.selection as TextSelection
    if ($cursor) {
      let transaction = convertTextToLinkWhenNecessary(schema, state, $cursor)
      if (transaction) {
        // Manually insert a space character because underline mark will be applied to
        // the default space character. We can avoid this by creating a new text node
        // without any mark.
        const spaceNode = schema.text(' ')
        transaction = transaction.insert(state.selection.head, spaceNode)
        dispatch?.(transaction)
        return true
      }
    }
    return false
  }
}

const textToLinkOnEnter = (schema: Schema): Command => {
  return (state, dispatch, view) => {
    const { $cursor } = state.selection as TextSelection
    if ($cursor) {
      const transaction = convertTextToLinkWhenNecessary(schema, state, $cursor)
      if (transaction) {
        const newState = state.apply(transaction)
        if (view) {
          view.updateState(newState)
          // Pass the updated state to base command so that transaction could work properly.
          baseKeymap.Enter?.(newState, dispatch, view)
        }
        return true
      } else {
        return chainCommands(createParagraphNear, liftEmptyBlock, splitBlock)(
          state,
          dispatch,
          view,
        )
      }
    }
    return false
  }
}

const convertTextToLinkWhenNecessary = (
  schema: Schema,
  state: EditorState,
  $cursor: ResolvedPos,
): Transaction | undefined => {
  const nodeBefore = $cursor.nodeBefore
  const nodeBeforeIsLink = nodeBefore?.marks.some(
    (mark) => mark.type.name === schema.mark('link')?.type.name,
  )

  if (!nodeBeforeIsLink && nodeBefore?.isText && nodeBefore.text) {
    // Convert text to link
    const match = urlRegex().exec(nodeBefore.text)
    if (match) {
      const nodes: Node[] = []

      if (match.index > 0) {
        // Text could be `www.abc.com` or `qwer www.abc.com` while enter is pressed, so we have to make sure
        // content before href is also preserved while converting text to link.
        const textBefore = nodeBefore.text?.substring(0, match.index)
        if (textBefore) {
          nodes.push(schema.text(textBefore))
        }
      }

      const href = match[0]
      nodes.push(createLinkNode(schema, href))

      const endPos = state.selection.head
      const startPos = endPos - nodeBefore.nodeSize
      return state.tr.replaceWith(startPos, endPos, nodes)
    }
  }

  return undefined
}
