jest.mock('@pubstudio/frontend/util-config', () => ({}))

jest.mock('@pubstudio/frontend/data-access-web-store', () => ({
  store: {
    misc: {},
    auth: {},
    user: {},
    site: {},
    editor: { setEditor: () => ({}) },
  },
}))

jest.mock('@pubstudio/frontend/feature-site-store', () => ({
  useLocalStore: () => ({
    restore: () => ({}),
    save: () => ({}),
    saveEditor: () => ({}),
  }),
}))
