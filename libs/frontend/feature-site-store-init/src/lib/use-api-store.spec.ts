import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { storeSite } from '@pubstudio/frontend/util-site-store'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISite, IStoredSite } from '@pubstudio/shared/type-site'
import { useApiStore } from './use-api-store'

const api = vi.hoisted(() => ({
  get: vi.fn(),
  update: vi.fn(),
}))

const webStore = vi.hoisted(() => {
  const fields = {
    name: { value: undefined as string | null | undefined },
    version: { value: undefined as string | null | undefined },
    defaults: { value: undefined as string | null | undefined },
    context: { value: undefined as string | null | undefined },
    pages: { value: undefined as string | null | undefined },
    pageOrder: { value: undefined as string | null | undefined },
    editor: { value: undefined as string | null | undefined },
    history: { value: undefined as string | null | undefined },
  }
  return {
    fields,
    store: {
      user: { identity: { value: { id: 'identity-id' } } },
      version: {
        editingEnabled: { value: true },
        activeVersionId: { value: undefined },
      },
      site: {
        ...fields,
        setSite: vi.fn((site: IStoredSite) => {
          for (const key of Object.keys(fields) as Array<keyof typeof fields>) {
            fields[key].value = site[key]
          }
        }),
        setEditor: vi.fn((editor: string) => {
          fields.editor.value = editor
        }),
      },
    },
  }
})

vi.mock('vue', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue')>()),
  inject: vi.fn(() => ({})),
}))

vi.mock('@pubstudio/frontend/data-access-api', () => ({
  useLocalSiteApi: () => ({
    getLocalSiteVersion: api.get,
    updateLocalSite: api.update,
  }),
  usePlatformSiteApi: vi.fn(),
}))

vi.mock('@pubstudio/frontend/data-access-web-store', () => ({
  setLocalContentUpdatedAt: vi.fn(),
  store: webStore.store,
}))

const storedSite = (): { site: ISite; stored: IStoredSite } => {
  const site = deserializeSite(JSON.stringify(mockSerializedSite)) as ISite
  return { site, stored: storeSite(site) }
}

describe('useApiStore dirty baseline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    webStore.store.version.editingEnabled.value = true
    webStore.store.version.activeVersionId.value = undefined
    for (const field of Object.values(webStore.fields)) {
      field.value = undefined
    }
  })

  const restore = async () => {
    const fixture = storedSite()
    api.get.mockResolvedValue({
      ...fixture.stored,
      updated_at: '100',
      content_updated_at: 50,
    })
    api.update.mockResolvedValue({ updated_at: '101' })
    const siteStore = useApiStore({ siteId: 'identity' })
    await siteStore.initialize()
    const restored = await siteStore.restore()
    return { siteStore, site: restored?.site as ISite, stored: fixture.stored }
  }

  it('diffs against the restored API site, not another site in browser storage', async () => {
    const { siteStore, site, stored } = await restore()
    webStore.fields.name.value = 'Renamed'
    site.name = 'Renamed'

    await siteStore.save(site, { immediate: true })

    expect(api.update).toHaveBeenCalledWith(
      'identity-id',
      { update_key: '100', name: 'Renamed' },
      false,
    )
    expect(stored.name).not.toEqual('Renamed')
  })

  it('retries an unchanged snapshot after a failed request', async () => {
    const { siteStore, site } = await restore()
    api.update
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce({ updated_at: '101' })
    site.name = 'Retry me'

    await siteStore.save(site, { immediate: true })
    await siteStore.save(site, { immediate: true })

    expect(api.update).toHaveBeenCalledTimes(2)
    expect(api.update.mock.calls[1][1]).toMatchObject({ name: 'Retry me' })
  })
})
