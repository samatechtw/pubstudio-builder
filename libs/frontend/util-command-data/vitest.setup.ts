import { vi } from 'vitest'

// Hoisted so it is available inside the (hoisted) vi.mock factory below.
const { store } = vi.hoisted(() => ({
  store: {
    initialize: () => ({}),
    restore: () => ({}),
    save: () => ({}),
    saveEditor: () => ({}),
  },
}))

vi.mock('@pubstudio/frontend/util-config', () => ({}))

vi.mock('@pubstudio/frontend/data-access-web-store', () => ({
  store: {
    misc: {},
    auth: {},
    user: {},
    site: { setSite: () => ({}), site: { value: {} } },
    editor: { setEditor: () => ({}) },
  },
}))

vi.mock('@pubstudio/frontend/feature-site-store', async (importOriginal) => {
  const actual = await importOriginal<{ useSiteSource: () => Record<string, unknown> }>()
  return {
    useLocalStore: () => store,
    useSiteStore: () => store,
    useSiteSource: () => ({
      ...actual.useSiteSource(),
      siteError: { value: {} },
      siteStore: { value: store },
      initializeSite: (_siteId: string | undefined) => ({}),
    }),
  }
})
