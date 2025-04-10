import Vue from '@vitejs/plugin-vue'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig, PluginOption } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
// TODO -- is it possible to get tsconfig paths to work in vite.config.ts?
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  appConfigBuild,
  appConfigServer,
  assetsInclude,
} from '../../libs/frontend/util-vite-config/src'

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
    ...appConfigBuild,
    cssMinify: 'lightningcss',
  },
  server: appConfigServer,
  publicDir: resolve('./src/public'),
  optimizeDeps: {
    include: ['@sampullman/fetch-api'],
  },
  plugins: [
    Vue(),
    viteSingleFile(),
    visualizer({
      template: 'treemap', // or sunburst
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'analyse.html', // will be saved in project's root
    }) as PluginOption,
  ],
  define: {
    __VUE_OPTIONS_API__: false,
  },
})
