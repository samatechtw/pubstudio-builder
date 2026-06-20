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
    // Integration suite: every spec resets a single shared backend in beforeEach,
    // so files must not run concurrently — run them serially in a single fork.
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
  },
})
