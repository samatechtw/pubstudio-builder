import { schemaCode } from '@pubstudio/frontend/util-edit-text'
import { Keys } from '@pubstudio/frontend/util-key-listener'
import hljs from 'highlight.js/lib/core'
import { keymap } from 'prosemirror-keymap'
import { Fragment, Slice } from 'prosemirror-model'
import { Plugin } from 'prosemirror-state'
import { highlightPlugin } from './prosemirror-highlighthjs-plugin'

// Manually create a new slice instead of using the third parameter `slice` from
// `handlePaste` because new line characters will be ignored for unknown reason
// when using it to do content replacement in the editor state.
const transformPasteContentPlugin = new Plugin({
  props: {
    handlePaste: (view, e) => {
      const pastedContent = e.clipboardData?.getData('text') ?? ''
      if (pastedContent) {
        const textNode = schemaCode.text(pastedContent)
        const slice = new Slice(Fragment.from(textNode), 0, 0)
        view.dispatch(view.state.tr.replaceSelection(slice))
      }
      return true
    },
  },
})

// Manually insert a new line instead of using the default behavior to avoid creating
// a new block of <p> as a sibling of <pre>.
const interceptNewLineEventPlugin = new Plugin({
  props: {
    handleDOMEvents: {
      keydown: (view, e) => {
        const { key, shiftKey, ctrlKey, metaKey } = e
        if (key === Keys.Enter && (shiftKey || ctrlKey || metaKey)) {
          // Use e.preventDefault() to prevent two new lines from being inserted when pressing
          // Shift + Enter.
          e.preventDefault()
          view.dispatch(view.state.tr.insertText('\n'))
          return true
        }
      },
    },
  },
})

export const codeEditorPlugins: Plugin[] = [
  keymap({
    // Insert 2 spaces in the selected position when tab is pressed.
    Tab: (state, dispatch) => {
      dispatch?.(state.tr.insertText('  ').scrollIntoView())
      return true
    },
  }),
  highlightPlugin(hljs),
  transformPasteContentPlugin,
  interceptNewLineEventPlugin,
]
