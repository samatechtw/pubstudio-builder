import { tsconfigBaseAliases } from 'nx-vue3-vite'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: tsconfigBaseAliases(__dirname),
  },
  test: {
    globals: true,
    // happy-dom provides window + localStorage natively.
    environment: 'happy-dom',
    root: __dirname,
    include: ['src/**/*.spec.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
})
