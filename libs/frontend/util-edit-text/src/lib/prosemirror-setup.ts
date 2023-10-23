import { IComponent } from '@pubstudio/shared/type-site'
import { baseKeymap } from 'prosemirror-commands'
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { DOMParser as ProseDOMParser, DOMSerializer } from 'prosemirror-model'
import { EditorState, Plugin } from 'prosemirror-state'
import { buildInputRules } from './input-rules'
import { buildKeymap } from './keymap'
import { schema } from './schema-basic'

export { buildKeymap, buildInputRules }

export interface IProsemirrorSetupOptions {
  component: IComponent
  /// Can be used to the key bindings created.
  mapKeys?: { [key: string]: string | false }
}

export function prosemirrorSetup(options: IProsemirrorSetupOptions): EditorState {
  const { component, mapKeys } = options
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
  ]
  const content = new DOMParser().parseFromString(component.content ?? '', 'text/html')
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
