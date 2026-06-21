# Vitest migration

Replacing Jest (ts-jest) with Vitest in pubstudio-builder. **DONE — jest is fully
retired.** All 87 `libs` `test` targets + the `api-site-test` `req-test`
integration target run on vitest; the `jest`/`ts-jest`/`@nx/jest` deps and root
`jest.config.cts` / `jest.preset.cts` are removed.

## Progress

- **87 / 87** `nx test` targets on vitest (24 `libs/shared` + 63 `libs/frontend`).
  Verified green via `nx run-many -t test -p tag:scope:shared` (24) and
  `tag:scope:frontend` (63). The only remaining jest is the `api-site-test`
  **`req-test`** target (a separate target name, not `test`) — see "Remaining".
- **`libs/shared` fully migrated** (all 24 projects). Real-test libs verified:
  `util-format` (48 tests), `util-parse` (14 tests); the rest are type/util libs
  with no specs (pass via `--passWithNoTests`).
  - Bulk migration via `tools/migrate-shared-to-vitest.py` (one-shot,
    verify-before-edit). 3 libs with a `configurations.ci` (coverage) block were
    finished by hand → `vitest run --coverage` + `@vitest/coverage-v8` installed.
- **`libs/frontend` fully migrated** (all 63 test targets). Bulk migration via
  `tools/migrate-frontend-to-vitest.py` (same shape as the shared codemod).
  Spec-bearing libs (29 tests across 8 libs), all green:
  `feature-copy-paste` (2), `feature-preview` (1), `util-api` (2),
  `util-component` (8), `util-doc` (1), `util-doc-site` (1), `util-router` (10),
  `util-validate` (4). The other 55 are no-spec type/util/data-access libs.
  - **No coverage in CI for any frontend lib** — none had a `configurations.ci`
    block, so `coverage.reportsDirectory` (the Nx-outputs-path caveat) is moot here.
    Add it only if a frontend lib later starts emitting coverage in CI.
- **Deferred to end of migration:** porting `util-test`
  (`setup-mock-behavior.ts`, a frontend helper) off the `jest` global (`jest.fn`,
  `jest.Mock`) to `vi`. It's imported by libs on both runners, so the
  `vitest.compat.ts` shim (`globalThis.jest = vi`) covers the interim. Only libs
  that actually *call* `setupMockBehavior` at runtime need the shim in their
  `setupFiles` (e.g. `data-access-command`); the 8 frontend spec libs above don't.

| Lib | Case | Result |
| --- | --- | --- |
| `shared/util-format` | easy — pure logic, global API | 4 files / 48 tests ✅ |
| `frontend/data-access-command` | volume — 44 files, mocks, setup file | 44 files / 167 tests ✅ |
| `frontend/feature-build` | hard — `import.meta`, localStorage, `jest.mock`+`requireActual` | 1 file / 1 test ✅ |

Wall-clock for the 167-test suite: **~1.1s**. (Vitest's reported "transform 13s"
is aggregate-across-workers, not wall time.)

## Why vitest fits here

- Already a Vite 7 shop. Vitest reuses Vite's transform pipeline — no ts-jest,
  no per-project `transform` block, no `.cts` config dance (`vitest.config.ts`
  is loaded by vitest itself, so `type: module` is a non-issue).
- **`import.meta` works natively.** The dependency graph uses `import.meta.hot`
  (`feature-site-store-init`) and `import.meta.env.VITE_*` (`util-config`). Under
  ts-jest that needed `ts-jest-mock-import-meta` + `diagnostics.ignoreCodes:[1343]`
  + mocking `util-config` out entirely. Vitest needs none of it.
- Tests are node/logic tests (no Vue mounting), so the port is mostly mechanical.

## The per-lib change set (the fan-out template)

For each lib:
1. **Add `vitest.config.ts`** — alias resolution via the existing
   `tsconfigBaseAliases(__dirname)` from `nx-vue3-vite` (no new path plugin).
   `globals: true` so specs keep using `describe/it/expect` unchanged.
2. **`tsconfig.spec.json`** — `types: ["jest","node"]` → `["vitest/globals","node"]`;
   drop `"module": "commonjs"`.
3. **`project.json`** — swap the `test` target from `@nx/jest:jest` to
   `nx:run-commands` running `vitest run` with `cwd` at the lib. (See "Nx
   executor" below for why not `@nx/vite`.)
4. **Delete `jest.config.ts`** (and port `jest.setup.ts` → `vitest.setup.ts`).
5. **Spec files: usually untouched.** Only specs using the `jest.*` API need edits.

## Real friction found (this is the actual migration cost)

1. **`jest.mock` factory hoisting is stricter in vitest.** ts-jest tolerated
   factories that referenced imported bindings or used `jest.requireActual`
   inside. Vitest hoists `vi.mock` above imports, so:
   - `jest.requireActual(m)` inside factory → `vi.mock(m, async (importOriginal) => ({ ...(await importOriginal()), ...overrides }))`
   - imported consts referenced in a factory → import them *inside* the factory
     (`const { X } = await import(...)`) or use `vi.hoisted`.
   - outer vars referenced in a factory → wrap in `vi.hoisted(() => ({ ... }))`.
   Affected here: `data-access-command/{add-component.spec, vitest.setup}`,
   `feature-build/vitest.setup`. Grep target: specs/setups with `jest.mock`.
2. **Shared test-helper libs use the `jest` global in their *source*.**
   `util-test/setup-mock-behavior.ts` calls `jest.fn()` / `jest.Mock`. These are
   imported by migrated AND not-yet-migrated libs, so they can't flip at once.
   Solution: `vitest.compat.ts` aliases `globalThis.jest = vi` (a transition
   shim, included via `setupFiles`). Remove it once every helper uses `vi`.
   - Covers `fn/spyOn/clearAllMocks/...`. Does NOT cover `jest.requireActual`
     (no `vi` equivalent — port those at the call site).
3. **`jest.clearAllMocks()` etc. in specs** → `vi.clearAllMocks()` (the shim also
   covers it, but prefer `vi.*` in migrated specs).
4. **Env replacements**: `testEnvironment:'node'` + `globals:{window:{}}` +
   `jest-localstorage-mock` → `environment: 'happy-dom'` (real window +
   localStorage). Use `'node'` where no DOM is touched. In `libs/frontend` the
   happy-dom libs were: `feature-copy-paste` (has specs), plus the no-spec
   `feature-render-builder` / `ui-build` / `ui-runtime` (ported for future specs).
5. **Specs importing `@jest/globals` directly** (e.g.
   `import { expect } from '@jest/globals'`) hard-fail under vitest with *"Do not
   import `@jest/globals` outside of the Jest test environment"*. Vitest provides
   `expect`/`describe`/`it` as globals — just delete the import. This is NOT caught
   by a `jest\.` grep. Grep target: `@jest/globals` in specs. (Found 1:
   `util-doc/uid.spec.ts`.)
6. **Pre-existing copy-paste bugs in two `project.json` test targets**, surfaced
   when the codemod's path-specific match missed: `feature-site-source`'s entire
   test/lint/`sourceRoot` pointed at `feature-site-store`, and `util-builtin`'s
   `jestConfig` pointed at `util-builder`. Fixed the **test target** to point at
   the lib itself (cwd + outputs); left the unrelated `sourceRoot`/`lint`
   mis-pointing alone (out of scope — flag separately).
7. **Stragglers with no test target.** `data-access-state` and `ui-widgets` have a
   `tsconfig.spec.json` (jest types) but no `test` target / specs; converted their
   types to `vitest/globals` for consistency. `util-test` / `util-test-mock` had a
   now-deleted `jest.config.ts` in their tsconfig `include` — removed.

## Nx executor note

`@nx/vite@20.5` peers `vite ^5||^6` and `vitest ≤3`, but this repo runs **vite 7**
+ vitest 4 — so the `@nx/vite:test` executor is out of range. We use
`nx:run-commands` instead (also a cleaner fit). For the full sweep, add `cache: true`
+ proper `inputs` to the target (or revisit `@nx/vite`'s inferred plugin if it
gains vite-7 support) so Nx caching still works.

## Remaining work (to fully retire jest) — DONE

All three final items have landed:

1. **`apps/api-site-test` (`req-test`) ✅** — migrated to `nx:run-commands` +
   `vitest run`. `runInBand` → `pool: 'forks'` + `poolOptions.forks.singleFork`
   (every spec resets a single shared backend in `beforeEach`, so files must run
   serially). `jest-setup.ts` → `vitest.setup.ts` (supertest assert patch, no jest
   API). `jest.config.ts` deleted; `tsconfig.spec` types → `vitest/globals` (and
   dropped `module: commonjs`). Two `it.each(() => return api…)` callbacks needed
   `async () => { await … }` — vitest types `it.each` callbacks as `Awaitable<void>`,
   so returning the supertest `Test` (a `PromiseLike<Response>`) is a TS2345 (plain
   `it` is lenient; only `it.each` trips). Verified structurally via `vitest list`
   (all 38 specs collect) + `tsc -p tsconfig.spec.json` (clean) + `nx lint` — the
   actual run still needs the backend stack.
2. **`util-test/setup-mock-behavior.ts` ✅** — `jest.fn` → `vi.fn`, `jest.Mock` →
   `import { type Mock, vi } from 'vitest'`. `vitest.compat.ts` deleted and its
   `setupFiles` refs removed from `data-access-command` **and** `feature-build`
   (the POC originally only named the first). Verified: `data-access-command`
   (167 tests, the only `setupMockBehavior` consumer) + `feature-build` green
   without the shim.
3. **Deps dropped ✅** — removed `jest`, `ts-jest`, `ts-jest-mock-import-meta`,
   `jest-localstorage-mock`, `@jest/globals`, `@nx/jest`, `@types/jest` from
   `package.json` (`pnpm install` pruned 145 packages); deleted root
   `jest.config.cts` / `jest.preset.cts`. Also swept 7 stale `"jest.config.ts"`
   literal entries left in `libs/shared/*` `tsconfig.spec.json`/`tsconfig.lib.json`
   include/exclude arrays (pointed at codemod-deleted files).

The only surviving "jest" strings are boilerplate ("via Jest") in per-lib
`README.md`s, a `firsttris.vscode-jest-runner` entry in `.vscode/extensions.json`,
and an explanatory comment in `feature-build/vitest.config.ts` — all cosmetic.

Mechanical-port recipe (reuse for `api-site-test`): the codemods
(`tools/migrate-{shared,frontend}-to-vitest.py`) templatize config files,
`project.json` targets, and `tsconfig.spec` types. Hand-work is only `jest.mock`
factories (friction item 1), `jest.requireActual` (item 1), `@jest/globals`
imports (item 5), and `jest.setup.ts` → `vitest.setup.ts`.
