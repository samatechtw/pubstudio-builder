jest.mock('@pubstudio/frontend/util-config', () => ({}))

jest.mock('@pubstudio/frontend/data-access-web-store', () => ({
  store: {
    misc: {},
    auth: {},
    user: {},
    version: { editingEnabled: { value: true } },
    site: { setSite: () => ({}), site: { value: {} } },
    editor: { setEditor: () => ({}) },
  },
}))

const store = {
  initialize: () => ({}),
  restore: () => ({}),
  save: () => ({}),
  saveEditor: () => ({}),
}

const actualSiteStore = jest.requireActual('@pubstudio/frontend/feature-site-store')

jest.mock('@pubstudio/frontend/feature-site-store', () => ({
  useLocalStore: () => store,
  useSiteStore: () => store,
  useSiteSource: () => ({
    ...actualSiteStore.useSiteSource(),
    siteError: { value: {} },
    siteStore: { value: store },
    initializeSite: (_siteId: string | undefined) => ({}),
  }),
}))
