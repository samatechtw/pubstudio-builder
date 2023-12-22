import {
  schemaCode,
  preserveWhiteSpacesDuringPaste,
} from '@pubstudio/frontend/util-edit-text'
import { Keys } from '@pubstudio/frontend/util-key-listener'
import hljs from 'highlight.js/lib/core'
import { keymap } from 'prosemirror-keymap'
import { Plugin } from 'prosemirror-state'
import { highlightPlugin } from './prosemirror-highlighthjs-plugin'

// Manually insert a new line instead of using the default behavior to avoid creating
// a new block of <p> as a sibling of <pre>.
// Use handleDOMEvents insead of keymap because combinations like 'Shift-Enter' didn't
// work for some reason; our callback function never gets executed.
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
  preserveWhiteSpacesDuringPaste(schemaCode),
  interceptNewLineEventPlugin,
]
