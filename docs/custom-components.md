# Custom Components

A custom component (called "reusable" in the UI) is a component definition that other
pages instantiate. Editing a definition updates every instance.

## Data model

- Each definition is a parentless root in `context.components`, listed in
  `context.customComponentIds`. `iterateCustomComponents` walks them for style generation.
- An instance is a single node linked via `customSourceId`. It has no children of its own.
- `renderChildren(context, component)` returns the component's children, or for an instance,
  stand-ins for the definition's children. Each stand-in gets:
  - element id `${hostId}_${defChildId}`, where the host is the instance or the stand-in
    above it, so the id is the expansion path (real ids never have `_`). A path keeps ids
    unique when one definition instantiates another twice.
  - `customSourceId = defChildId`, so content, inputs, events and the `.defChildId` style
    class are inherited through the same paths a stored instance node uses.
  - the nested definition's class as a mixin, when the definition child is itself an
    instance. Expansion stops when a definition would expand itself.
- **Per-instance edits** are on the instance as `instanceOverrides[defChildId]`, which
  supports `content` and `inputs`. `style.overrides[defChildId]` has child styles, emitted as
  `.instanceId .defChildId`.

`isCustomComponentPart` walks to the root, so membership needs no bookkeeping. It replaced
the `customChildIds` set, which v3 removes.

## Style precedence

Definition rules are emitted into the `custom` stylesheet, which the builder and the
renderer place before the page stylesheet. At equal specificity the later rule wins, so:

    definition mixins < definition styles < instance mixins < instance styles

## Lifecycle

| Command                    | Behavior                                                                     |
| -------------------------- | ---------------------------------------------------------------------------- |
| `ConvertToCustomComponent` | Detach from page, register component, insert an instance at the old position |
| `RemoveCustomComponent`    | Unregister and delete the definition tree; refused while instances exist     |
| `DetachInstance`           | Replace an instance with an independent copy of what it currently renders    |
| `EditComponent`            | Rename a definition, from the custom menu or the edit screen                 |
| `SetInstanceOverride`      | Set or clear one instance's content override for a definition child          |

`AddCustomComponent` ('addR') is the superseded v2 command. It only registers, and is
kept so stored histories replay.

## Editing one instance's children

Clicking an expanded child on the canvas selects the instance and records which
definition child was clicked in `editor.selectedInstanceChildId`. The component menu then
shows a Child panel that writes `SetInstanceOverride` — the v3 replacement for editing a
v2 shell node. Per-child styles go through the existing child style overrides, which list
the whole expansion for an instance. Events stay definition-level.

## Component edit screen

A definition is not on any page, so it is edited in a synthetic arena page
(`component-arena.ts`). `getActivePage` returns the arena while `editor.editingComponentId`
is set, and the canvas, component tree, style menus and undo stack work unchanged.

Anything in the arena other than the definition is scaffolding, containers that
constrain width, background colors, sibling content. It is stored per definition in
`editor.componentArenas[definitionId]` with a `arena-c-slot` placeholder marking where
the definition mounts, and never enters `context.customComponents`, release rendering or
SSG output. Scaffolding is dimmed in the tree and outlined on the canvas.

Entering records the current selection in `editor.componentEditReturnId`; Done restores it
so the instance you came from is selected again. A recorded selection that is itself in a
definition or the arena — after a reload, where the definition was the saved selection — is
dropped instead, leaving nothing selected.

## Migration v2 → v3

See `migrate-v2-v3.ts`

1. Instance subtrees are collapsed, top level `content`/`inputs` become `instanceOverrides`,
   and custom styles/existing overrides are re-keyed from shell ids to definition child ids,
   then deleted.
2. Behavior args that referenced a shell id change to the definition child, and
   the remapping is logged. State changes there are shared by every instance, per-shell
   targeting is not representable in v3.
3. Each definition is detached from its page and an instance is inserted at its old
   position, so the origin page renders identically.

`migrateV3ToV2` restores definitions to their recorded positions and removes the
instances that replaced them.

Sites saved at v3 do not load in a v2 frontend, so web and SSG deploy together.
