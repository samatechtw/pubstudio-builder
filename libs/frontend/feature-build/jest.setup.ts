jest.mock('@pubstudio/frontend/util-config', () => ({ builderConfig: {} }))

const actualDeserialize = jest.requireActual('@pubstudio/frontend/util-site-deserialize')

jest.mock('@pubstudio/frontend/util-site-deserialize', () => ({
  ...actualDeserialize,
  loadSiteLanguage: () => ({}),
}))
