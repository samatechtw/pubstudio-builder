# Text Editing

[ProseMirror](https://prosemirror.net/) is used for editing content in individual components. We rely on ProseMirror's internal state while text editing, and serialize back to HTML when complete.

The text editing workflow starts when an eligible component is selected, and ends when the component is un-selected. During this time, undo/redo are handled by ProseMirror, while serialized HTML is tracked via a single PubStudio `EditComponent` command. When editing completes, the command is "finalized", and at this point the undo command while roll back all changes during the ProseMirror session (e.g. ProseMirror undo history is lost).

Editing procedure:

- User clicks a component eligible for text editing. Ineligible components include those with children, images, videos, and line breaks.
  - Detected in `setSelectedComponent` in `editor-helpers.ts`
- A ProseMirror editor is created with `createEditorView` and stored in the EditorContext
  - Note - the EditorView is not serialized, but should be recreated when a site is loaded with an eligible `selectedComponent`
- The renderer displays `innerHTML` for the selected component based on the current state of the EditorView, serialized with `editorStateToHtml`
- All clicks and key presses are now handled/controlled by the ProseMirror EditorView
- The first change creates an `EditComponent` command with `content` equal to the current HTML
- Subsequent changes replace the current command
- The EditorView is destroyed when the component is de-selected

## Libraries

- `@pubstudio/web/feature-edit-text` - includes a high level function for creating a new ProseMirror `EditView` for a PubStudio component. It hooks into ProseMirror's `dispatchTransaction` to save the latest state in PubStudio history.
- `@pubstudio/frontend/util-edit-text` - interface to the ProseMirror libraries.
  - `input-rules.ts` - Supports some markdown-like behavior. For example, entering a dash and adding a space will start an unordered list.
  - `schema-basic.ts` - Originally copied from [prosemirror-schema-basic](https://github.com/ProseMirror/prosemirror-schema-basic), contains our custom document schema.
  - `keymap.ts` - Defines keybindings supported while editing text.

## Future Improvements

It is possible to retain ProseMirror's undo/redo history, and we may implement this in the future. ProseMirror [does not implement serialization](https://discuss.prosemirror.net/t/save-and-apply-reuse-history/2522/5), which is necessary for including in our local or API store. A ough process for retaining history:

- Copy [prosemirror-history](https://github.com/ProseMirror/prosemirror-history) into the repo
- Implement `toJSON`, dropping any selection that is not serializable
- Add a new PubStudio command `SetContent` for setting content, and include serialized history
- When ctrl-z is pressed and `SetContent` is the last command, initialize ProseMirror with the serialized history and execute a single undo
- ProseMirror now handles key presses
- When ctrl-z is pressed an there is no remaining ProseMirror history, bubble the undo command up to our command stack.

## Code Editors

TBD

Several code editors will eventually be implemented for modifying raw CSS, HTML, and component behaviors (Javascript) when necessary.
