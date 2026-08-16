# Agent Tools

`libs/frontend/feature-agent-tools` installs `window.PubStudio`, containing read/edit tools
for AI agents to drive from outside the app (e.g. `chrome-devtools-mcp`'s `evaluate_script`
against a builder tab). Every mutation goes through the existing command stack, so agent
edits undo like a human's.

The code is the source of truth. `PubStudio.describe()` is the tool and op reference, this
page covers non-obvious design constraints and maintenance rules.

## Enabling

`<AgentToolsBridge v-if="agentToolsEnabled()" />` is mounted from the builder shell
(`Build.vue` in the private repo). It is on for `import.meta.env.DEV`, for `?ai=1` (which
also persists to `localStorage['pubstudio.agent-tools']`), and off again for `?ai=0`. A
badge with a disconnect button renders bottom-right while it is installed.

This is not a capability boundary. Any script on the builder page already reaches the site
model and API token, `window.store` has always been exposed for debugging. The flag exists
to keep an obvious automation entry point off the default surface, give the user a visible
signal and a kill switch, and keep the code out of the default bundle.

The public entry point (`src/index.ts`) exports only `agentToolsEnabled()` and an
async-wrapped `AgentToolsBridge`. Keep it that way — re-exporting the registry pulls all
41 op schemas into the builder bundle and defeats the lazy chunk (currently ~55 KB raw /
17 KB gzipped, loaded only when the flag is on).

## The central invariant

Command data is symmetric: it carries both halves so undo works.

```ts
interface ISetComponentCustomStyleData {
  componentId: string
  breakpointId: string
  oldStyle?: IStyleEntry // must match the CURRENT live value
  newStyle?: IStyleEntry
}
```

If an agent supplies a wrong or missing `old*`, the command applies fine and **silently
corrupts undo**. So an agent never authors an `ICommand`.

Instead it names an **op**, which is the forward half. The op's `resolve(ctx, input)`
reads the live site and computes the inverse half. That framing has a useful consequence:
the existing undo machinery becomes a correctness oracle for every op we ship (see
[Round-trip suite](#round-trip-suite)).

## Anatomy of an op

```
src/lib/
├── schema/          # JSON-Schema DSL + shared field schemas (componentId, breakpointId, …)
├── op/              # OpDef, registry, drift guard, resolve helpers, test fixture
├── ops/             # the 41 op definitions, grouped by command family
├── read/            # compact agent-facing views (tree text, component views, find)
├── tools/           # identify / describe / apply / history / status / session
├── install.ts       # installs window.PubStudio, returns uninstall()
└── AgentToolsBridge.vue
```

An `IOpDef` carries `name`, `command`, `title`, `description`, an `input` schema, `derived`,
`omitted`, `resolve` and `example`. `derived` and `omitted` are not documentation — they are
what makes the drift guard work.

### Why the type parameters look the way they do

`defineOp<TData>()({...})` infers three more parameters:

- **`TDerived extends keyof TData`.** Declaring `derived: readonly (keyof TData)[]` looks
  equivalent but is not: TypeScript then infers the element type from the contextual type,
  so `TOp['derived'][number]` comes back as `keyof TData` and the drift guard silently
  passes for every field. The same trap applies to `omitted`, hence
  `TOmitted extends Partial<Record<keyof TData, string>>`.
- **`NoInfer<TInput>` on `resolve` and `example`.** Without it, `example()`'s return type
  competes with `input` as an inference site, and `TInput` collapses to whatever fields the
  example happens to pass — every other field then reads as "does not exist".

If you change `IOpDef`, re-verify the guard still triggers (below).

### No validation dependency

`schema/schema.ts` is a ~190-line DSL. The workspace has no validation dependency and this
lib has to stay small enough to lazy-load. It emits JSON Schema for `describe()`, validates
with issue paths (`ops[3].input.property`), and infers TypeScript types.

Two behaviours to preserve when editing it:

- **Unknown object keys are errors.** That is what turns an agent's `propery` typo into a
  fixable message instead of a silent no-op.
- **Long enums are summarised in errors.** `oneOf` over 105 CSS properties must not dump all
  105 names into a validation message; it reports near-misses and points at `describe()`.

`.optional()` widens to `T | undefined` and the object type mapper turns those into optional
keys, so there is no separate input/output type. `.dflt(v)` only annotates the JSON Schema
and marks the field optional — the op applies the fallback itself in `resolve`.

## The two compile-time guarantees

**Adding a command.** `OP_REGISTRY` is `Record<CommandType, OpEntry>`, so a new
`CommandType` member fails to compile until it is either wrapped in an op or explicitly
`excluded('reason')`. Same mechanism `applyCommand` already relies on.

**Modifying a command.** `op/op-drift.ts` asserts, per op, that every field of the command
data type is accounted for — supplied by the agent (`input`), computed by the resolver
(`derived`), or refused (`omitted`, with a written reason). Adding a field to an `I*Data`
type breaks the build until someone decides, in code, which of the three it is. The error
names the field:

```
op-drift.ts(129,7): error TS2322: Type 'boolean' is not assignable to type
  '{ ERROR: "command data field not accounted for by op"; fields: "oldStyle"; }'.
```

This guards the field set, not semantics. A field whose meaning changes still needs the
round-trip suite to catch it.

> **Nothing imports `op-drift.ts`** — it exists purely to be typechecked. Neither vite nor
> eslint typechecks, and CI has no `tsc` step, so `nx test feature-agent-tools` runs
> `tsc -p tsconfig.typecheck.json` before vitest. That is the only thing supporting
> the drift guard, don't drop it from the `test` target.

## Round-trip suite

`op/op-round-trip.spec.ts` is generic over the registry. For every op it parses `example()`
against the op's own schema, resolves it, applies the commands, asserts something changed,
then undoes and asserts the site is byte-identical. A new op ships one `example()` and
inherits all of it.

Three things about that suite are easy to get wrong when editing it:

- **Compare content, not `stringifySite`.** `stringifySite` includes `history` and `editor`,
  and any push-then-undo sequence necessarily leaves the entry on `history.forward`.
  `siteContentSnapshot` covers pages, context and defaults only.
- **Sort keys.** Undo routinely re-adds a deleted key at the end of an object. Insertion
  order is not meaningful in the site model and failing on it produces only noise.
- **The "did something" assertion uses a wider snapshot** that includes `editor.active`, so
  editor-only ops such as `changePage` are still covered.

The mock site is too small to exercise 41 ops — one page, one mixin, one non-root component,
no behaviors, fonts or override styles. `op/test-site.ts` seeds those with plain commands
before the snapshot is taken, so the comparison stays exact.

## Adding an op

1. Write it in the matching `ops/*.ts` file. Reuse the pure data makers in
   `frontend/util-command-data` rather than deriving the undo half by hand — that is what
   they are for, and the editor's own command wrappers use the same ones.
2. Register it in `op/op-registry.ts` under its `CommandType`.
3. Add one `Accounted<...>` line to `op/op-drift.ts`.
4. Give it an `example()` that actually changes the seeded test site. If it needs state the
   fixture lacks, seed that in `op/test-site.ts`.
5. `nx test feature-agent-tools`.

One op per `CommandType` — the registry is keyed by command. Where a command covers both
create and delete (`SetBehavior`), the op takes an explicit flag rather than splitting.

Op names are agent-facing prose, not a mirror of the enum. Drop the `Component` prefix where
the object is obvious, keep it where there is ambiguity (`setComponentStyle` vs
`setMixinStyle`).

## `apply()` semantics worth knowing

- **One `apply()` call is one undo step.** `pushAppliedGroup` records the already-applied
  commands as a single `CommandType.Group` and does _not_ unwrap single-command groups —
  unwrapping would drop the batch `label`, and "one call, one entry" is easier to explain.
- **Validation is atomic; resolution is not.** Every op's input is schema-checked up front,
  so an invalid batch applies nothing. A resolver can still fail at op 12 of 20 on live
  state a schema cannot check (an id an earlier op deleted). In that case the applied prefix
  is kept and reported as `ok: false` _with_ `result.partial`, `applied` and `failedIndex`.
  The prefix is still one undo step, so `history({action:'undo'})` is a complete rollback.
  `ok: false` therefore does not mean "nothing happened" — anything consuming `apply()` must
  check `result.partial`.
- **Created ids are collected per command, right after it is applied**, because ids are
  allocated during apply. `AddComponent` writes `data.id` in place; mixins and behaviors are
  read back off `latestStyleId`/`latestBehaviorId`; `AddPage` creates its root inside the
  command, so the root id is read from `site.pages[route]`.

## Site type differences

`apply()` needs no branching on site type — `ISiteStore.save` abstracts both — but three
behaviours differ, and `status()`/`identify()` report `storage: 'api' | 'local'` so an agent
can tell.

|                       | Site API sites (paid)                                                                 | Scratch / identity (`useLocalStore`)                                                    |
| --------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `save(site, options)` | Writes localStorage, then debounces an API `PUT`, or awaits it on `{immediate: true}` | Writes localStorage only. **Ignores `options`** — no debounce, no immediate distinction |
| `saveState`           | Real lifecycle: `Saving` → `Saved` / `Error`                                          | Constant `Saved`, never transitions                                                     |
| `editingEnabled`      | Checked again inside `save`; false while a version/draft preview is active            | Not checked (local sites have no versions)                                              |

So `apply({save: 'immediate'})` is always safe to pass, and `status().saveState` is not a
progress signal on scratch/identity sites — `saveStateMeaningful` says which case you are
in.

## Conventions an agent has to be told

Included in `identify()`'s orientation payload, but important enough to repeat:

- Ids are namespaced: `<ns>-c-N` components, `-s-N` mixins, `-b-N` behaviors, `-bp-N`
  breakpoints.
- Style values may reference theme variables as `${variable-name}`.
- Styles cascade from the default breakpoint (`breakpoint-1`, desktop) down to smaller
  ones. Set the base value there and override only where it differs.
- The `Css` enum has **no longhand `margin-bottom` / `padding-top` / etc.** — only the
  shorthands. Agents reach for the longhand constantly.
- `read({styles: {componentId, resolved: true}})` reports which mixin or breakpoint each
  effective value came from. Use it before fighting an inherited value.

## Known gaps

- **No generated op reference.** `describe()` is the live source of truth; a
  `docs/agent-tools-reference.md` generated from `OP_REGISTRY` with a CI drift check was
  designed but not built.
- **No skill package** for the agent side of the workflow.
- **No e2e spec.** The flow has been driven by hand over chrome-devtools-mcp; a Playwright
  spec would keep the bridge, gating flag, save path and reactivity covered.
- **`role` is lost on remove + undo.** Neither `IAddComponentData` nor `IRemoveComponentData`
  has a `role` field, so `addComponent` cannot set one either (`editComponent` can, after the
  fact). Fixing it means touching both data types plus `addComponentHelper`,
  `makeRemoveComponentData` and `undoRemoveComponentHelper`.
- **`undoRemoveComponentMixin` re-adds with `push`**, losing the mixin's position in the
  component's list, so undoing a removal can change the cascade.
- **`undoRemovePage` activates the restored page**, not the page that was active before the
  removal — so `removePage` is not an exact round trip on editor state.
