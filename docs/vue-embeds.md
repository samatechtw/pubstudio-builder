# Custom Vue embeds

A site can embed a precompiled Vue component from a script the user uploads. The component
is found by name on `window` and rendered by `render-vue-component.ts`.

## Contract

- Published pages expose the full Vue runtime namespace as `window.Vue`
  (`apps/web-site/src/window-vue.ts`). Bundles must externalize `vue` to that global and not
  ship their own runtime.
- `componentName` resolves `window[componentName]`. It is a global name, not a package or
  file name. Nested namespaces need an alias on `window`.
- Published builds set `__VUE_OPTIONS_API__: false`, so use the Composition API with compiled
  templates. There is no runtime template compiler, router, or Pinia.
- Each embed polls for its export after mount, reports one console diagnostic after eight
  seconds, and keeps polling while mounted. The first hydration render is always the empty
  placeholder.

## Script ordering

Custom scripts must run after the runtime defines `window.Vue`. Two rules keep that true:

- On static pages, site and page scripts are not emitted in the prerendered head. They are
  kept in the payload and added by `replaceHead` after the runtime mounts. This delays all
  configured scripts, including analytics, until hydration.
- Dynamically created scripts default to `async = false` (the property, set in
  `page-head.ts`) so classic bundles execute in insertion order. `async: true` is an opt-in
  for independent scripts. Note `setAttribute('async', 'false')` enables async, since it is
  a boolean attribute.
