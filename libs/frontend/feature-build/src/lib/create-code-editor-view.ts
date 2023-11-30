import {
  editorStateTextContent,
  prosemirrorSetup,
  schemaCode,
} from '@pubstudio/frontend/util-edit-text'
import hljs from 'highlight.js/lib/core'
import { keymap } from 'prosemirror-keymap'
import { Plugin, Selection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { highlightPlugin } from './prosemirror-highlighthjs-plugin'

const codeEditorPlugins: Plugin[] = [
  keymap({
    // Insert 2 spaces in the selected position when tab is pressed.
    Tab: (state, dispatch) => {
      dispatch?.(state.tr.insertText('  ').scrollIntoView())
      return true
    },
  }),
  highlightPlugin(hljs),
]

export function createCodeEditorView(
  code: string,
  container: HTMLElement,
  onChange: (code: string) => void,
): EditorView | undefined {
  if (!container) {
    return undefined
  }

  const state = prosemirrorSetup({
    schema: schemaCode,
    content: `<pre><code>${code}</code></pre>`,
    plugins: [...codeEditorPlugins],
  })

  const view = new EditorView(container, {
    state,
    dispatchTransaction(transaction) {
      let newState = view.state.apply(transaction)
      const { textContent } = newState.doc
      if (newState.doc.content.firstChild?.type.name !== 'code_block') {
        // When using hljs with ProseMirror editor, the code must be wrapped inside
        // `<pre><code>...</code></pre>` for highlighting&styling feature to work. If a user
        // removes all the text from the editor (i.e. select all text then press backspace),
        // the leading&ending <pre><code> well also be removed, causing the highlighting & styling
        // feature to stop working. We need to manually wrap the content inside <pre><code> in such cases.

        // FIXME
        // 1. The current solution will clear the history because it creates a brand-new editor state.
        //    Find a way to replace the content in the editor state while keeping everything.
        // 2. New line characters are ignored if the text is copied from a source other than ProseMirror
        //    editor. For example, VSCode.
        newState = prosemirrorSetup({
          schema: schemaCode,
          content: `<pre><code>${textContent}</code></pre>`,
          plugins: [...codeEditorPlugins],
        })
        newState.selection = Selection.atEnd(newState.doc)
      }
      view.updateState(newState)

      const code = editorStateTextContent(schemaCode, newState)
      onChange(code)
    },
  })

  return view
}
