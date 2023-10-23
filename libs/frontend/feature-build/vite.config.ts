import VueI18n from '@intlify/unplugin-vue-i18n/vite'
import Vue from '@vitejs/plugin-vue'
import { tsconfigBaseAliases } from 'nx-vue3-vite'
import path from 'path'
import { defineConfig } from 'vite'
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { assetsInclude } from '../../../libs/frontend/util-vite-config/src'

const resolve = (p: string): string => path.resolve(__dirname, p)

module.exports = defineConfig({
  assetsInclude,
  plugins: [Vue(), VueI18n({})],
  resolve: {
    alias: {
      '@theme/': `${resolve('../ui-theme/src')}/`,
      ...tsconfigBaseAliases(__dirname),
    },
  },
  build: {
    lib: {
      entry: resolve('./src/index.ts'),
      name: 'frontend-feature-build',
      fileName: (format) => `frontend-feature-build.${format}.js`,
    },
    rollupOptions: {
      // externalize deps that shouldn't be bundled
      external: ['vue'],
      output: {
        // globals to use in the UMD build for externalized deps
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
