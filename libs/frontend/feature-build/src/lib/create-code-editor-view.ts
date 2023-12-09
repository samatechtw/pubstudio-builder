import {
  editorStateTextContent,
  prosemirrorSetup,
  schemaCode,
} from '@pubstudio/frontend/util-edit-text'
import { Selection } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { Slice, Fragment } from 'prosemirror-model'
import { codeEditorPlugins } from './code-editor-plugins'

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
        // `<pre><code>...</code></pre>`, which corresponds to the `code_block` node
        // in the schema for highlighting&styling feature to work.
        // If a user removes all the text from the editor (i.e. select all text then press backspace),
        // the leading&ending <pre><code> well also be removed, causing the highlighting & styling
        // feature to stop working. So we need to manually add the `code_block` node back in such cases.
        const codeBlockNode = schemaCode.node(
          'code_block',
          undefined,
          schemaCode.text(textContent),
        )
        const slice = new Slice(Fragment.from(codeBlockNode), 0, 0)
        newState = newState.apply(
          newState.tr.replaceRange(0, newState.doc.content.size, slice),
        )
        newState.selection = Selection.atEnd(newState.doc)
      }
      view.updateState(newState)

      const code = editorStateTextContent(schemaCode, newState)
      onChange(code)
    },
  })

  return view
}
