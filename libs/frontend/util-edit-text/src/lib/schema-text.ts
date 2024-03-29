// Copyright (C) 2015-2017 by Marijn Haverbeke <marijn@haverbeke.berlin> and others

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { DOMOutputSpec, MarkSpec, NodeSpec, Schema } from 'prosemirror-model'

const pDOM: DOMOutputSpec = ['div', { class: 'pm-p' }, 0],
  blockquoteDOM: DOMOutputSpec = ['blockquote', 0],
  hrDOM: DOMOutputSpec = ['hr'],
  brDOM: DOMOutputSpec = ['br']

/// [Specs](#model.NodeSpec) for the nodes defined in this schema.
const nodes = {
  /// NodeSpec The top level document node.
  doc: {
    content: 'block+',
  } as NodeSpec,

  /// A plain paragraph textblock. Represented in the DOM
  /// as a `<div>` element so that i18n nodes can be nested
  paragraph: {
    content: 'inline*',
    group: 'block',
    parseDOM: [{ tag: 'div' }, { tag: 'p' }],
    toDOM() {
      return pDOM
    },
  } as NodeSpec,

  /// A blockquote (`<blockquote>`) wrapping one or more blocks.
  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM() {
      return blockquoteDOM
    },
  } as NodeSpec,

  /// A horizontal rule (`<hr>`).
  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM() {
      return hrDOM
    },
  } as NodeSpec,

  /// A heading textblock, with a `level` attribute that
  /// should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  /// `<h6>` elements.
  heading: {
    attrs: { level: { default: 1 } },
    content: 'inline*',
    group: 'block',
    defining: true,
    parseDOM: [
      { tag: 'h1', attrs: { level: 1 } },
      { tag: 'h2', attrs: { level: 2 } },
      { tag: 'h3', attrs: { level: 3 } },
      { tag: 'h4', attrs: { level: 4 } },
      { tag: 'h5', attrs: { level: 5 } },
      { tag: 'h6', attrs: { level: 6 } },
    ],
    toDOM(node) {
      return ['h' + node.attrs.level, 0]
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

  /// An inline image (`<img>`) node. Supports `src`,
  /// `alt`, and `href` attributes. The latter two default to the empty
  /// string.
  image: {
    inline: true,
    attrs: {
      src: {},
      alt: { default: null },
      title: { default: null },
    },
    group: 'inline',
    draggable: true,
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs(dom: HTMLElement) {
          return {
            src: dom.getAttribute('src'),
            title: dom.getAttribute('title'),
            alt: dom.getAttribute('alt'),
          }
        },
      },
    ],
    toDOM(node) {
      const { src, alt, title } = node.attrs
      return ['img', { src, alt, title }]
    },
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

const emDOM: DOMOutputSpec = ['em', 0],
  uDOM: DOMOutputSpec = ['u', 0],
  codeDOM: DOMOutputSpec = ['code', 0]

/// [Specs](#model.MarkSpec) for the marks in the schema.
const marks = {
  /// A link. Has `href` and `title` attributes. `title`
  /// defaults to the empty string. Rendered and parsed as an `<a>`
  /// element.
  link: {
    attrs: {
      href: {},
      title: { default: null },
      target: { default: null },
    },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a',
        getAttrs(dom: HTMLElement) {
          return {
            href: dom.getAttribute('href'),
            title: dom.getAttribute('title'),
            target: dom.getAttribute('target'),
          }
        },
      },
    ],
    toDOM(node) {
      const { href, title, target } = node.attrs
      return ['a', { href, title, target }, 0]
    },
  } as MarkSpec,

  /// Emphasis mark. Rendered as `<em>`. Parses `<i>` and `font-style: italic`
  em: {
    parseDOM: [
      { tag: 'i' },
      { tag: 'em' },
      { style: 'font-style=italic' },
      { style: 'font-style=normal', clearMark: (m) => m.type.name == 'em' },
    ],
    toDOM() {
      return emDOM
    },
  } as MarkSpec,

  // Underline mark. Rendered as `<u>`.
  u: {
    parseDOM: [
      {
        tag: 'u',
        style: 'font-style=underline',
      },
      {
        style: 'text-decoration=underline',
      },
    ],
    toDOM() {
      return uDOM
    },
  },

  // Text color mark
  color: {
    attrs: {
      color: { default: '' },
    },
    parseDOM: [
      {
        style: 'color',
        getAttrs(value) {
          return { color: value }
        },
      },
    ],
    toDOM(mark) {
      return ['span', { style: `color:${mark.attrs.color}` }, 0]
    },
  } as MarkSpec,

  // Background color mark
  bg: {
    attrs: {
      'background-color': { default: '' },
    },
    parseDOM: [
      {
        style: 'background-color',
        getAttrs(value) {
          return { 'background-color': value }
        },
      },
    ],
    toDOM(mark) {
      return ['span', { style: `background-color:${mark.attrs['background-color']}` }, 0]
    },
  } as MarkSpec,

  // Font size color mark
  size: {
    attrs: {
      'font-size': { default: '' },
    },
    parseDOM: [
      {
        style: 'font-size',
        getAttrs(value) {
          return { 'font-size': value }
        },
      },
    ],
    toDOM(mark) {
      return ['span', { style: `font-size:${mark.attrs['font-size']}` }, 0]
    },
  } as MarkSpec,

  // Font size color mark
  font: {
    attrs: {
      'font-family': { default: '' },
    },
    parseDOM: [
      {
        style: 'font-family',
        getAttrs(value) {
          return { 'font-family': value }
        },
      },
    ],
    toDOM(mark) {
      return ['span', { style: `font-family:${mark.attrs['font-family']}` }, 0]
    },
  } as MarkSpec,

  /// A strong mark. Rendered as `<span>`, parse rules also match
  /// `<b>`, `<strong>` and `font-weight:`.
  strong: {
    attrs: {
      'font-weight': { default: '' },
    },
    parseDOM: [
      {
        tag: 'strong',
        getAttrs(value) {
          return { 'font-weight': value }
        },
      },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      {
        tag: 'b',
        getAttrs: (node: HTMLElement) => {
          if (node.style.fontWeight === 'normal') {
            return { 'font-weight': '400' }
          }
          return { 'font-weight': '700' }
        },
      },
      {
        style: 'font-weight',
        getAttrs: (value: string) => {
          if (/^(bold(er)?|[0-9]\d{2,})$/.test(value)) {
            return { 'font-weight': value }
          }
          return null
        },
      },
    ],
    toDOM(mark) {
      return ['span', { style: `font-weight:${mark.attrs['font-weight']}` }, 0]
    },
  } as MarkSpec,

  /// Code font mark. Represented as a `<code>` element.
  code: {
    parseDOM: [{ tag: 'code' }],
    toDOM() {
      return codeDOM
    },
  } as MarkSpec,
}

export const schemaText = new Schema({ nodes, marks })
