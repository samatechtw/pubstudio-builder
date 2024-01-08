import { DOMOutputSpec, MarkSpec, NodeSpec, Schema } from 'prosemirror-model'

const pDOM: DOMOutputSpec = ['p', 0],
  brDOM: DOMOutputSpec = ['br']

/// [Specs](#model.NodeSpec) for the nodes defined in this schema.
const nodes = {
  /// NodeSpec The top level document node.
  doc: {
    content: 'block+',
  } as NodeSpec,

  /// A plain paragraph textblock. Represented in the DOM
  /// as a `<p>` element.
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'p' }],
    toDOM() {
      return pDOM
    },
  } as NodeSpec,

  /// A code listing. Disallows marks or non-text inline
  /// nodes by default. Represented as a `<pre>` element with a
  /// `<code>` element inside of it.
  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (node: HTMLElement | string) => ({
          params: (<Element>node)?.getAttribute('data-params') || '',
        }),
      },
    ],
    toDOM(node) {
      return ['pre', { 'data-params': node.attrs.params, class: 'hljs' }, ['code', 0]]
    },
  } as NodeSpec,

  /// The text node.
  text: {
    group: 'inline',
  } as NodeSpec,

  /// A hard line break, represented in the DOM as `<br>`.
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM() {
      return brDOM
    },
  } as NodeSpec,
}

const codeDOM: DOMOutputSpec = ['code', 0]

/// [Specs](#model.MarkSpec) for the marks in the schema.
const marks = {
  /// Code font mark. Represented as a `<code>` element.
  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM() {
      return codeDOM
    },
  } as MarkSpec,
}

export const schemaCode = new Schema({ nodes, marks })
