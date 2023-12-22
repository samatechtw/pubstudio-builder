import { Fragment, Node, Schema, Slice } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { createLinkNode } from './prosemirror-utils'
import { urlRegex } from './text-to-link-keymap'

/**
 * Transform urls to links during paste. This plugin should not be used together
 * with `preserveWhiteSpacesDuringPaste` because they both try to insert content
 * to the doc during paste.
 */
export const parseLinksDuringPaste = (schema: Schema) => {
  return new Plugin({
    props: {
      handlePaste: (view, e) => {
        const pastedContent = e.clipboardData?.getData('text') ?? ''
        if (pastedContent) {
          const lines = pastedContent.split('\n').filter((line) => !!line)
          const nodes: Node[] = []

          lines.forEach((line, index) => {
            const subNodes = textNodesFromText(schema, line)
            if (index === 0) {
              nodes.push(...subNodes)
            } else {
              // Put the content in every subsequent line to an individual <p> node so that
              // those content will be displayed in a new line.
              const paragraphNode = schema.node('paragraph', undefined, subNodes)
              nodes.push(paragraphNode)
            }
          })

          const slice = new Slice(Fragment.fromArray(nodes), 0, 0)
          view.dispatch(view.state.tr.replaceSelection(slice))
        }
        return true
      },
    },
  })
}

/**
 * Create text nodes (with/without link mark) based on the given text.
 */
const textNodesFromText = (schema: Schema, text: string): Node[] => {
  const matches = Array.from(text.matchAll(urlRegex()))
  if (matches.length) {
    return textNodesFromTextWithUrl(schema, matches, text)
  } else {
    // No URL was found in text.
    return [schema.text(text)]
  }
}

const textNodesFromTextWithUrl = (
  schema: Schema,
  matches: RegExpMatchArray[],
  fullText: string,
): Node[] => {
  const nodes: Node[] = []

  let cursor = 0
  let text = ''

  matches.forEach((match) => {
    const matchIndex = match.index ?? 0
    while (cursor < matchIndex) {
      text += fullText[cursor++]
    }

    // Append the text before href
    if (text) {
      nodes.push(schema.text(text))
      text = ''
    }

    // Append link node
    const href = match[0]
    nodes.push(createLinkNode(schema, href))
    cursor = cursor + href.length
  })

  // Append remaining text
  text = fullText.substring(cursor)
  if (text) {
    nodes.push(schema.text(text))
  }

  return nodes
}
