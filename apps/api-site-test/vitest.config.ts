import { tsconfigBaseAliases } from 'nx-vue3-vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: tsconfigBaseAliases(__dirname),
  },
  test: {
    globals: true,
    environment: 'node',
    root: __dirname,
    include: ['test/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
    // Every spec resets one shared backend in beforeEach via non-atomic DROP+migrate,
    // so overlapping resets corrupt the DB. The files.must run fully serially.
    fileParallelism: false,
  },
})
