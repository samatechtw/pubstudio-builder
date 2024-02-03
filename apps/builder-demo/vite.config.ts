import Vue from '@vitejs/plugin-vue'
import { tsconfigBaseAliases } from 'nx-vue3-vite'
import path from 'path'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
// TODO -- is it possible to get tsconfig paths to work in vite.config.ts?
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  appConfigBuild,
  appConfigServer,
  assetsInclude,
} from '../../libs/frontend/util-vite-config/src'

const resolve = (p: string): string => path.resolve(__dirname, p)

export default defineConfig({
  assetsInclude,
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@theme/': `${resolve('../../libs/frontend/ui-theme/src')}/`,
      ...tsconfigBaseAliases(__dirname),
    },
  },
  build: {
    ...appConfigBuild,
  },
  server: appConfigServer,
  publicDir: resolve('./src/public'),
  optimizeDeps: {
    include: ['date-fns'],
  },
  plugins: [Vue(), splitVendorChunkPlugin()],
})
