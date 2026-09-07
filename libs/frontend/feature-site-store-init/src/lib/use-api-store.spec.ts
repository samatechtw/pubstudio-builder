import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { storeSite } from '@pubstudio/frontend/util-site-store'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ICommandBatch, IAcceptedOperation } from '@pubstudio/shared/type-command'
import { ISite, IStoredSite, SiteSaveState } from '@pubstudio/shared/type-site'
import { useApiStore } from './use-api-store'

const api = vi.hoisted(() => ({
  get: vi.fn(),
  update: vi.fn(),
  submit: vi.fn(),
  operations: vi.fn(),
}))

const injectedApi = vi.hoisted(() => ({
  baseUrl: 'https://api.example/api/',
  userToken: { value: 'owner-token' },
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
  inject: vi.fn(() => injectedApi),
}))

vi.mock('@pubstudio/frontend/data-access-api', () => ({
  useLocalSiteApi: () => ({
    getLocalSiteVersion: api.get,
    updateLocalSite: api.update,
    submitOperations: api.submit,
    getOperations: api.operations,
  }),
  usePlatformSiteApi: vi.fn(),
}))

vi.mock('@pubstudio/frontend/data-access-web-store', () => ({
  setLocalContentUpdatedAt: vi.fn(),
  store: webStore.store,
}))

class MockWebSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static instances: MockWebSocket[] = []

  readyState = MockWebSocket.CONNECTING
  sent: string[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: (() => void) | null = null

  constructor(readonly url: string) {
    MockWebSocket.instances.push(this)
  }

  send(message: string) {
    this.sent.push(message)
  }

  close() {
    this.readyState = 3
  }

  receive(message: object) {
    this.onmessage?.({ data: JSON.stringify(message) } as MessageEvent)
  }
}

const storedSite = (): { site: ISite; stored: IStoredSite } => {
  const site = deserializeSite(JSON.stringify(mockSerializedSite)) as ISite
  return { site, stored: storeSite(site) }
}

describe('useApiStore collaboration queue', () => {
  let accepted: IAcceptedOperation[]

  beforeEach(() => {
    vi.clearAllMocks()
    accepted = []
    MockWebSocket.instances = []
    webStore.store.version.editingEnabled.value = true
    webStore.store.version.activeVersionId.value = undefined
    for (const field of Object.values(webStore.fields)) field.value = undefined
    api.operations.mockImplementation((_id: string, afterRevision: number) =>
      Promise.resolve({
        current_revision: accepted.length,
        operation_floor: 0,
        content_updated_at: 50 + accepted.length,
        operations: accepted.filter((operation) => operation.revision > afterRevision),
        snapshot_required: false,
      }),
    )
    api.submit.mockImplementation((_id: string, batch: ICommandBatch) => {
      const operation: IAcceptedOperation = {
        ...batch,
        revision: accepted.length + 1,
        author_id: 'user-1',
        created_at: new Date().toISOString(),
      }
      accepted.push(operation)
      return Promise.resolve({
        operation,
        changed: true,
        duplicate: false,
        content_updated_at: 50 + operation.revision,
      })
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  const restore = async () => {
    const fixture = storedSite()
    api.get.mockResolvedValue({
      ...fixture.stored,
      updated_at: '100',
      content_updated_at: 50,
      revision: 0,
      operation_floor: 0,
    })
    const siteStore = useApiStore({ siteId: 'identity' })
    await siteStore.initialize()
    const restored = await siteStore.restore()
    return { siteStore, site: restored?.site as ISite, stored: fixture.stored }
  }

  const restoreWithSocket = async () => {
    vi.stubGlobal('window', { addEventListener: vi.fn() })
    vi.stubGlobal('WebSocket', MockWebSocket)
    const restored = await restore()
    const listener = vi.fn()
    const unsubscribe = restored.siteStore.subscribeCollaboration?.(listener)
    const socket = MockWebSocket.instances[0]
    socket.readyState = MockWebSocket.OPEN
    socket.onopen?.()
    return { ...restored, socket, listener, unsubscribe }
  }

  it('submits only preconditioned commands instead of a site snapshot', async () => {
    const { siteStore, site } = await restore()
    site.name = 'Renamed'

    await siteStore.save(site, { immediate: true })

    expect(api.submit).toHaveBeenCalledTimes(1)
    const [id, batch] = api.submit.mock.calls[0] as [string, ICommandBatch]
    expect(id).toEqual('identity-id')
    expect(batch).toMatchObject({ protocol_version: 1, base_revision: 0 })
    expect(batch.commands).toEqual([
      {
        type: 'set',
        section: 'name',
        path: [],
        expected: { kind: 'value', value: mockSerializedSite.name },
        value: 'Renamed',
      },
    ])
    expect(JSON.stringify(batch)).not.toContain('"pages":')
  })

  it('retries a lost request with the same stable batch ID', async () => {
    const { siteStore, site } = await restore()
    const successfulSubmit = api.submit.getMockImplementation()
    api.submit
      .mockRejectedValueOnce(new Error('network down'))
      .mockImplementationOnce(successfulSubmit as never)
    site.name = 'Retry me'

    await siteStore.save(site, { immediate: true })
    await siteStore.save(site, { immediate: true })

    expect(api.submit).toHaveBeenCalledTimes(2)
    expect(api.submit.mock.calls[1][1].batch_id).toEqual(
      api.submit.mock.calls[0][1].batch_id,
    )
  })

  it('keeps editor and undo history private to the tab', async () => {
    const { siteStore, site } = await restore()
    site.history.back.push({ type: 'undo' as never, data: {} })
    if (site.editor) site.editor.active = 'style'

    await siteStore.save(site, { immediate: true })

    expect(api.submit).not.toHaveBeenCalled()
  })

  const remoteOperation = (version: string): IAcceptedOperation => ({
    protocol_version: 1,
    batch_id: `remote-${version}`,
    client_id: 'remote-tab',
    base_revision: accepted.length,
    revision: accepted.length + 1,
    author_id: 'user-2',
    created_at: new Date().toISOString(),
    commands: [
      {
        type: 'set',
        section: 'version',
        path: [],
        expected: { kind: 'value', value: mockSerializedSite.version },
        value: version,
      },
    ],
  })

  it('delivers remote operations consumed during save to the reactive site on restore', async () => {
    const { siteStore, site } = await restore()
    accepted.push(remoteOperation('remote-version'))
    site.name = 'Local name'

    await siteStore.save(site, { immediate: true })
    const rebased = await siteStore.restore(123)

    expect(rebased?.site.name).toEqual('Local name')
    expect(rebased?.site.version).toEqual('remote-version')
    expect(rebased?.site.history).toEqual(site.history)
  })

  it('delivers socket operations without polling the HTTP operation log', async () => {
    const { siteStore, socket, listener, unsubscribe } = await restoreWithSocket()
    expect(socket.url).toEqual(
      'wss://api.example/api/local_sites/identity-id/operations/ws',
    )
    expect(JSON.parse(socket.sent[0])).toMatchObject({
      type: 'authenticate',
      token: 'owner-token',
      after_revision: 0,
    })

    socket.receive({
      type: 'operation',
      operation: remoteOperation('socket-version'),
      content_updated_at: 51,
    })
    await vi.waitFor(() => expect(listener).toHaveBeenCalledTimes(1))
    const restored = await siteStore.restore(123)

    expect(restored?.site.version).toEqual('socket-version')
    expect(api.operations).not.toHaveBeenCalled()
    unsubscribe?.()
    expect(socket.readyState).toEqual(3)
  })

  it('uses socket catch-up after authentication without a redundant HTTP read', async () => {
    const { socket, listener, unsubscribe } = await restoreWithSocket()
    socket.receive({
      type: 'authenticated',
      current_revision: 1,
      operation_floor: 0,
      content_updated_at: 51,
    })
    socket.receive({
      type: 'operation',
      operation: remoteOperation('catch-up'),
      content_updated_at: 51,
    })
    socket.receive({
      type: 'revision',
      current_revision: 1,
      operation_floor: 0,
      content_updated_at: 51,
    })
    await vi.waitFor(() => expect(listener).toHaveBeenCalled())
    expect(api.operations).not.toHaveBeenCalled()
    unsubscribe?.()
  })

  it('discards queued messages when the last subscriber disconnects', async () => {
    const { socket, listener, unsubscribe } = await restoreWithSocket()
    socket.receive({
      type: 'operation',
      operation: remoteOperation('stale-socket'),
      content_updated_at: 51,
    })
    unsubscribe?.()
    await new Promise((resolve) => setTimeout(resolve, 10))
    expect(listener).not.toHaveBeenCalled()
    expect(socket.onmessage).toBeNull()
  })

  it('ignores the snapshot reset caused by its own full save', async () => {
    const { siteStore, site, socket, listener } = await restoreWithSocket()
    api.update.mockResolvedValue({
      revision: 1,
      operation_floor: 0,
      content_updated_at: 70,
    })
    api.operations.mockResolvedValue({
      current_revision: 1,
      operation_floor: 0,
      content_updated_at: 70,
      operations: [],
      snapshot_required: false,
    })

    await siteStore.save(site, { snapshot: true })
    socket.receive({
      type: 'snapshot_reset',
      revision: 1,
      operation_floor: 0,
      content_updated_at: 70,
    })
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(listener).not.toHaveBeenCalled()
    expect(await siteStore.restore(123)).toBeUndefined()
    expect(api.get).toHaveBeenCalledTimes(1)

    socket.receive({
      type: 'snapshot_reset',
      revision: 2,
      operation_floor: 0,
      content_updated_at: 80,
    })
    await vi.waitFor(() => expect(listener).toHaveBeenCalledTimes(1))
    expect((await siteStore.restore(123))?.site).toBeDefined()
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('retries a failed submit with backoff and right after the socket reconnects', async () => {
    vi.useFakeTimers()
    const { siteStore, site, socket } = await restoreWithSocket()
    api.submit.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    site.name = 'Offline edit'

    await siteStore.save(site, { immediate: true })

    expect(api.submit).toHaveBeenCalledTimes(1)
    expect(siteStore.saveError.value?.code).toEqual('CollaborationNetworkError')
    expect(siteStore.saveState.value).toEqual(SiteSaveState.Saving)

    api.submit.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await vi.advanceTimersByTimeAsync(1000)
    expect(api.submit).toHaveBeenCalledTimes(2)

    // The second retry backs off to 2s; a socket reconnect resubmits immediately
    await vi.advanceTimersByTimeAsync(500)
    expect(api.submit).toHaveBeenCalledTimes(2)
    socket.receive({
      type: 'authenticated',
      current_revision: 0,
      operation_floor: 0,
      content_updated_at: 50,
    })
    await vi.advanceTimersByTimeAsync(1)
    await vi.advanceTimersByTimeAsync(1)

    expect(api.submit).toHaveBeenCalledTimes(3)
    expect(siteStore.saveError.value).toBeUndefined()
    expect(siteStore.saveState.value).toEqual(SiteSaveState.Saved)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(api.submit).toHaveBeenCalledTimes(3)
  })

  it('does not replace the reactive site after its own accepted save', async () => {
    const { siteStore, site } = await restore()
    site.name = 'Own edit'

    await siteStore.save(site, { immediate: true })

    expect(api.submit).toHaveBeenCalledTimes(1)
    expect(await siteStore.restore(123)).toBeUndefined()
    expect(api.get).toHaveBeenCalledTimes(1)
  })

  it('reloads the snapshot when the revision moves without logged operations', async () => {
    const { siteStore } = await restore()
    api.operations.mockResolvedValueOnce({
      current_revision: 5,
      operation_floor: 0,
      content_updated_at: 60,
      operations: [],
      snapshot_required: false,
    })

    const restored = await siteStore.restore(123)

    expect(restored?.site).toBeDefined()
    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('reloads the snapshot instead of replaying a non-contiguous log', async () => {
    const { siteStore } = await restore()
    const skipped = remoteOperation('skipped')
    skipped.revision = 2
    api.operations.mockResolvedValueOnce({
      current_revision: 2,
      operation_floor: 0,
      content_updated_at: 60,
      operations: [skipped],
      snapshot_required: false,
    })

    await siteStore.restore(123)

    expect(api.get).toHaveBeenCalledTimes(2)
  })

  it('loads a newly selected version, then stops collaboration sync while it is active', async () => {
    const { siteStore } = await restore()
    webStore.store.version.activeVersionId.value = 'live-version' as never

    expect((await siteStore.restore(123))?.site).toBeDefined()
    expect(api.get).toHaveBeenLastCalledWith('identity-id', 'live-version')
    expect(await siteStore.restore(123)).toBeUndefined()
    expect(api.operations).not.toHaveBeenCalled()
  })

  it('merges ID counter allocations by max instead of a precondition', async () => {
    const { siteStore, site } = await restore()
    site.context.nextId += 2

    await siteStore.save(site, { immediate: true })

    const [, batch] = api.submit.mock.calls[0] as [string, ICommandBatch]
    expect(batch.commands).toEqual([
      expect.objectContaining({ type: 'set', path: ['nextId'], merge: 'max' }),
    ])
  })

  it('replaces the whole document for snapshot saves and resyncs the revision', async () => {
    const { siteStore, site } = await restore()
    api.update.mockResolvedValue({
      revision: 7,
      operation_floor: 0,
      content_updated_at: 99,
    })
    site.name = 'Imported'

    await siteStore.save(site, { immediate: true, snapshot: true })
    api.operations.mockResolvedValue({
      current_revision: 7,
      operation_floor: 0,
      content_updated_at: 99,
      operations: [],
      snapshot_required: false,
    })
    site.name = 'After import'
    await siteStore.save(site, { immediate: true })

    expect(api.update).toHaveBeenCalledWith(
      'identity-id',
      expect.objectContaining({ name: 'Imported', pages: expect.any(String) }),
    )
    expect(api.update.mock.calls[0][1]).not.toHaveProperty('history')
    expect(api.submit).toHaveBeenCalledTimes(1)
    expect(api.submit.mock.calls[0][1].base_revision).toEqual(7)
  })

  it('pauses outbound saves on a conflict and resumes after loading the accepted version', async () => {
    const { siteStore, site } = await restore()
    api.submit.mockRejectedValueOnce({
      status: 409,
      code: 'CollaborationConflict',
      message: 'the scalar value changed',
    })
    site.name = 'Conflicting'

    await siteStore.save(site, { immediate: true })
    expect(siteStore.saveError.value?.code).toEqual('CollaborationConflict')
    site.name = 'Still paused'
    await siteStore.save(site, { immediate: true })
    expect(api.submit).toHaveBeenCalledTimes(1)

    const reloaded = await siteStore.restore()
    expect(reloaded?.site.name).toEqual(mockSerializedSite.name)
    site.name = 'Resumed'
    await siteStore.save(site, { immediate: true })
    expect(api.submit).toHaveBeenCalledTimes(2)
  })
})
