/*
Control which npm packages from the root package.json are included app Dockerfile builds.
See tools/scripts/package-subset.js
*/

export default {
  web: {
    include: [
      // dependencies
      'vue',
      '@sampullman/fetch-api',
      // devDependencies
      '@nrwl/workspace',
      '@samatech/postcss-basics',
      '@vitejs/plugin-vue',
      'nx-vue3-vite',
      'postcss',
      'typescript',
      'vite',
      '@samatech/vue-store',
      '@unhead/vue',
    ],
  },
}
