import { vi } from 'vitest'

vi.mock('@pubstudio/frontend/util-config', () => ({ builderConfig: {} }))

vi.mock('@pubstudio/frontend/util-site-deserialize', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@pubstudio/frontend/util-site-deserialize')>()
  return {
    ...actual,
    loadSiteLanguage: () => ({}),
  }
})
