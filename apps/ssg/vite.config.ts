import { tsconfigBaseAliases } from 'nx-vue3-vite'
import path from 'path'
import { defineConfig } from 'vite'

const resolve = (p: string): string => path.resolve(__dirname, p)

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: tsconfigBaseAliases(__dirname),
  },
  build: {
    ssr: true,
    target: 'node20',
    outDir: '../../dist/apps/ssg',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        server: resolve('src/server.ts'),
        cli: resolve('src/cli.ts'),
      },
      output: {
        entryFileNames: '[name].mjs',
        format: 'es',
      },
    },
  },
  ssr: {
    // Bundle all deps (vue, @vue/server-renderer, libs) into the output
    noExternal: true,
  },
})
