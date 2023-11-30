import { baseKeymap } from 'prosemirror-commands'
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { DOMParser as ProseDOMParser, DOMSerializer, Schema } from 'prosemirror-model'
import { Command, EditorState, EditorStateConfig, Plugin } from 'prosemirror-state'
import { buildInputRules } from './input-rules'
import { buildKeymap } from './keymap'

export interface IProsemirrorSetupOptions {
  content: string
  schema: Schema
  mapKeys?: { [key: string]: Command }
  plugins?: EditorStateConfig['plugins']
}

export function prosemirrorSetup(options: IProsemirrorSetupOptions): EditorState {
  const { content: contentOption, mapKeys, plugins: pluginsOption, schema } = options
  const plugins = [
    buildInputRules(schema),
    keymap(buildKeymap(schema, mapKeys)),
    keymap(baseKeymap),
    gapCursor(),
    history(),
    new Plugin({
      props: {
        attributes: { class: 'pm-style' },
      },
    }),
    ...(pluginsOption ?? []),
  ]
  const content = new DOMParser().parseFromString(contentOption, 'text/html')
  return EditorState.create({
    doc: ProseDOMParser.fromSchema(schema).parse(content),
    plugins,
  })
}

export function editorStateToHtml(
  schema: Schema,
  state: EditorState,
): string | undefined {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  const div = document.createElement('div')
  div.id = '__pm-serialize__'
  div.appendChild(fragment)
  const html = div.innerHTML
  const textContent = div.textContent
  div.parentNode?.removeChild(div)
  if (textContent) {
    return html
  } else {
    // Returns undefined so that components like horizontal&vertical container can include other components
    // as children again when the text content is cleared.
    return undefined
  }
}

export function editorStateTextContent(schema: Schema, state: EditorState): string {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  return fragment.textContent ?? ''
}
