import { Plugin } from 'prosemirror-state'
import { Schema, Slice, Fragment } from 'prosemirror-model'

/**
 * Make sure white spaces and new line characters are preserved during paste. This plugin
 * should not be used together with `parseLinksDuringPaste` because they both try to insert
 * content into the doc during paste.
 */
export const preserveWhiteSpacesDuringPaste = (schema: Schema) => {
  return new Plugin({
    props: {
      handlePaste: (view, e) => {
        const pastedContent = e.clipboardData?.getData('text') ?? ''
        if (pastedContent) {
          const textNode = schema.text(pastedContent)
          const slice = new Slice(Fragment.from(textNode), 0, 0)
          view.dispatch(view.state.tr.replaceSelection(slice))
        }
        // Return true because the content is already inserted to the doc.
        return true
      },
    },
  })
}
