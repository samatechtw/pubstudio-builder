import { vi } from 'vitest'

vi.mock('@pubstudio/frontend/util-config', () => ({}))

vi.mock('@pubstudio/frontend/data-access-web-store', () => ({
  store: {
    misc: {},
    auth: {},
    user: {},
    site: {},
    editor: { setEditor: () => ({}) },
  },
}))

vi.mock('@pubstudio/frontend/feature-site-store', () => ({
  useLocalStore: () => ({
    restore: () => ({}),
    save: () => ({}),
    saveEditor: () => ({}),
  }),
}))
