import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets'
import Vue from '@vitejs/plugin-vue'
import { tsconfigBaseAliases } from 'nx-vue3-vite'
import path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
// eslint-disable-next-line @nx/enforce-module-boundaries
import { assetsInclude } from '../../../libs/frontend/util-vite-config/src'

const resolve = (p: string): string => path.resolve(__dirname, p)

export default defineConfig({
  assetsInclude,
  plugins: [
    Vue(),
    dts({ rollupTypes: true }),
    libAssetsPlugin({
      limit: 1024 * 4,
      include: /\.(pdf|jpg|jpeg|png|webm|mp4|svg|ttf|woff|woff2)$/,
    }),
  ],
  resolve: {
    alias: {
      '@theme/': `${resolve('../ui-theme/src')}/`,
      ...tsconfigBaseAliases(__dirname),
    },
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve('./src/index.ts'),
      name: 'pubstudio-util',
      fileName: (format) => `pubstudio-util.${format}.js`,
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
