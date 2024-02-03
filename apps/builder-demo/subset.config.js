/*
Control which npm packages from the root package.json are included app Dockerfile builds.
See tools/scripts/package-subset.js
*/

export default {
  'builder-demo': {
    include: [
      // dependencies
      'vue',
      '@sampullman/fetch-api',
      'petite-vue-i18n',
      'vue-router',
      'date-fns',
      'jwt-decode',
      // devDependencies
      '@samatech/image-api-types',
      '@samatech/postcss-basics',
      '@vitejs/plugin-vue',
      'nx-vue3-vite',
      'postcss',
      'prosemirror-gapcursor',
      'prosemirror-history',
      'prosemirror-inputrules',
      'prosemirror-keymap',
      'prosemirror-model',
      'prosemirror-schema-list',
      'prosemirror-state',
      'prosemirror-transform',
      'prosemirror-view',
      'highlight.js',
      'typescript',
      'vite',
      '@floating-ui/vue',
      '@samatech/vue-store',
      '@unhead/vue',
      '@videojs/themes',
      '@vue/runtime-dom',
      '@vue/devtools-api',
      '@vue/runtime-core',
      '@vue/shared',
      '@vue/reactivity',
      'vue-demi',
    ],
    patch: {
      pnpm: {
        neverBuiltDependencies: ['@parcel/watcher', 'cypress'],
      },
    },
  },
}
