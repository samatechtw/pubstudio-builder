import Vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { assetsInclude } from '../../libs/frontend/util-vite-config/src'

// Builds the shared SSG hydration runtime (site.js) served to all statically
// generated sites at /_ps/site.js. See src/main-hydrate.ts and apps/ssg.

const resolve = (p: string): string => path.resolve(__dirname, p)

const makeAliases = (libs: string[]): Record<string, string> => {
  const aliases: Record<string, string> = {}
  for (const lib of libs) {
    aliases[`@pubstudio/${lib}`] = resolve(`../../libs/${lib}/src/index.ts`)
  }
  return aliases
}

export default defineConfig({
  assetsInclude,
  resolve: {
    preserveSymlinks: true,
    alias: makeAliases([
      'frontend/data-access-site-api',
      'frontend/util-api',
      'frontend/util-router',
      'frontend/feature-site-source',
      'frontend/feature-render',
      'frontend/ui-runtime',
      'frontend/util-defaults',
      'frontend/util-resolve',
      'frontend/util-runtime',
      'frontend/util-render',
      'frontend/util-site-deserialize',
      'shared/util-web-site-api',
      'shared/type-site',
      'shared/type-api-site-sites',
      'shared/type-api-site-custom-data',
    ]),
  },
  build: {
    outDir: '../../dist/apps/web-site-hydrate',
    emptyOutDir: true,
    minify: 'terser',
    rollupOptions: {
      input: resolve('src/main-hydrate.ts'),
      output: {
        format: 'iife',
        entryFileNames: 'site.js',
        // Single self-contained file; no code-splitting or asset emission
        inlineDynamicImports: true,
      },
    },
  },
  optimizeDeps: {
    include: ['@sampullman/fetch-api'],
  },
  plugins: [Vue()],
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: true,
  },
})
