import { vi } from 'vitest'

// Fixtures are built with real commands, which reach the web store; nothing under test uses it.
vi.mock('@pubstudio/frontend/util-config', () => ({}))

vi.mock('@pubstudio/frontend/data-access-web-store', () => ({
  store: {
    misc: {},
    auth: {},
    user: {},
    version: { editingEnabled: { value: true } },
    site: { setSite: () => ({}), site: { value: {} } },
    editor: { setEditor: () => ({}) },
  },
}))
