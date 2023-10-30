import { baseKeymap } from 'prosemirror-commands'
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { DOMParser as ProseDOMParser, DOMSerializer } from 'prosemirror-model'
import { EditorState, EditorStateConfig, Plugin } from 'prosemirror-state'
import { buildInputRules } from './input-rules'
import { buildKeymap } from './keymap'
import { schema } from './schema-basic'

export { buildKeymap, buildInputRules }

export interface IProsemirrorSetupOptions {
  content: string
  /// Can be used to the key bindings created.
  mapKeys?: { [key: string]: string | false }
  plugins?: EditorStateConfig['plugins']
}

export function prosemirrorSetup(options: IProsemirrorSetupOptions): EditorState {
  const { content: contentnOption, mapKeys, plugins: pluginsOption } = options
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
  const content = new DOMParser().parseFromString(contentnOption, 'text/html')
  return EditorState.create({
    doc: ProseDOMParser.fromSchema(schema).parse(content),
    plugins,
  })
}

export function editorStateToHtml(state: EditorState): string {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  const div = document.createElement('div')
  div.id = '__pm-serialize__'
  div.appendChild(fragment)
  const html = div.innerHTML
  div.parentNode?.removeChild(div)
  return html
}

export function editorStateTextContent(state: EditorState): string {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(state.doc.content)
  return fragment.textContent ?? ''
}
