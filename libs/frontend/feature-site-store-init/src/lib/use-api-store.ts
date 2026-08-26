import { useLocalSiteApi, usePlatformSiteApi } from '@pubstudio/frontend/data-access-api'
import {
  restoreSiteError,
  restoreSiteHelper,
} from '@pubstudio/frontend/data-access-command'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { GetSiteVersionFn, useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import {
  setLocalContentUpdatedAt,
  store,
} from '@pubstudio/frontend/data-access-web-store'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { builderConfig, resolveSiteServerAddress } from '@pubstudio/frontend/util-config'
import { setCollaborationClientId } from '@pubstudio/frontend/util-ids'
import {
  applyAcceptedOperations,
  applyWireCommands,
  diffStoredSites,
  serializeEditor,
  storeSite,
} from '@pubstudio/frontend/util-site-store'
import { IApiError } from '@pubstudio/shared/type-api'
import {
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import {
  collaborationProtocolVersion,
  ICommandBatch,
  IOperationsResponse,
  ISubmitBatchResponse,
  WireCommand,
} from '@pubstudio/shared/type-command'
import {
  IEditorContext,
  ISite,
  ISiteRestore,
  ISiteSaveOptions,
  ISiteStore,
  ISiteStoreInitializeResult,
  IStoredSite,
  SiteSaveState,
} from '@pubstudio/shared/type-site'
import { plainResponseInterceptors } from '@pubstudio/shared/util-web-site-api'
import { computed, inject, Ref, ref } from 'vue'
import { SiteSaveAlert, siteSaveAlert } from './site-save-alert'

export interface IUseApiStoreProps {
  siteId: string
  siteApiUrl?: string
  authBypassToken?: Ref<string>
}

interface IPersistedPending {
  commands: WireCommand[]
  batch?: ICommandBatch
}

type PrivateState = Pick<IStoredSite, 'editor' | 'history'>

const documentSections = [
  'name',
  'version',
  'context',
  'defaults',
  'pages',
  'pageOrder',
] as const

const randomId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Suffixed onto every generated site ID, so it must not contain `-` (see `parseNamespace`)
const makeClientId = (): string => randomId().replace(/-/g, '').slice(0, 10)

// Reject HMR for the API store. Revision/pending state are module-local.
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    import.meta.hot?.invalidate('Reject HMR for API store')
  })
}

export const useApiStore = (props: IUseApiStoreProps): ISiteStore => {
  const platformApi = inject(ApiInjectionKey) as PSApi
  const siteId = ref(props.siteId)
  const saveError = ref<IApiError>()
  const lastSavedAt = ref<number>()
  const contentDirty = ref(false)
  const requestInFlight = ref(false)
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let getFn: GetSiteVersionFn
  let updateFn: (
    siteId: string,
    payload: IUpdateSiteApiRequest,
  ) => Promise<IUpdateSiteApiResponse>
  let submitFn: (siteId: string, batch: ICommandBatch) => Promise<ISubmitBatchResponse>
  let operationsFn: (
    siteId: string,
    afterRevision: number,
  ) => Promise<IOperationsResponse>
  // Canonical server document at `apiSnapshot.revision`
  let apiSnapshot: IStoredSite | undefined
  // Canonical document plus this tab's unacknowledged edits and private editor state
  let pendingSnapshot: IStoredSite | undefined
  let pendingBatch: ICommandBatch | undefined
  let outboundPaused = false
  let syncPromise: Promise<void> | undefined
  let updatePromise: Promise<void> | undefined
  let snapshotRefreshRequired = false
  // Remote operations were merged into `pendingSnapshot` but the reactive builder site
  // has not received them yet. The polling restore() call delivers them.
  let remoteChangePending = false
  let loadedVersionId: string | undefined
  let clientId = ''

  const session = () =>
    typeof sessionStorage === 'undefined' ? undefined : sessionStorage
  const key = (suffix: string) => `pubstudio:collaboration:${siteId.value}:${suffix}`

  const readSession = <T>(suffix: string): T | undefined => {
    try {
      const value = session()?.getItem(key(suffix))
      return value ? JSON.parse(value) : undefined
    } catch {
      return undefined
    }
  }

  const writeSession = (suffix: string, value: unknown): boolean => {
    try {
      session()?.setItem(key(suffix), JSON.stringify(value))
      return true
    } catch (e) {
      console.log(`Collaboration session write failed (${suffix}):`, e)
      return false
    }
  }

  const removeSession = (suffix: string) => session()?.removeItem(key(suffix))

  const getClientId = (): string => {
    const stored = readSession<string>('client')
    if (stored && !stored.includes('-')) return stored
    const created = makeClientId()
    writeSession('client', created)
    return created
  }

  const savePrivateState = (stored: IStoredSite) => {
    if (!writeSession('private', { editor: stored.editor, history: stored.history })) {
      writeSession('private', { editor: stored.editor })
    }
  }

  const privateState = (): PrivateState => ({
    editor: pendingSnapshot?.editor,
    history: pendingSnapshot?.history,
  })

  // Persisted on page hide and on failed submits, so a reload resumes the interrupted
  // save. Never persisted while paused: the pending diff would then be relative to a
  // canonical document the local edits conflict with.
  const persistPending = () => {
    if (!apiSnapshot || !pendingSnapshot || outboundPaused) return
    const commands = diffStoredSites(apiSnapshot, pendingSnapshot)
    if (!commands.length) {
      removeSession('pending')
      return
    }
    const value: IPersistedPending = { commands, batch: pendingBatch }
    writeSession('pending', value)
  }

  const preserveRecovery = (reason: string, commands?: WireCommand[]) => {
    if (!pendingSnapshot) return
    removeSession('pending')
    writeSession('recovery', {
      reason,
      saved_at: Date.now(),
      site: pendingSnapshot,
      commands: commands ?? pendingBatch?.commands,
    })
  }

  const revisionOf = (stored: IStoredSite | undefined) => stored?.revision ?? 0

  const saveState = computed(() => {
    if (contentDirty.value || requestInFlight.value) return SiteSaveState.Saving
    return SiteSaveState.Saved
  })

  const initialize = async (): Promise<ISiteStoreInitializeResult | undefined> => {
    let serverAddress: string | undefined
    let siteVersion = builderConfig.siteFormatVersion
    if (siteId.value === 'identity') {
      const api = useLocalSiteApi(platformApi)
      siteId.value = store.user.identity.value.id
      getFn = api.getLocalSiteVersion
      updateFn = api.updateLocalSite
      submitFn = api.submitOperations
      operationsFn = api.getOperations
    } else {
      if (props.siteApiUrl) {
        serverAddress = props.siteApiUrl
      } else {
        const { getSite } = usePlatformSiteApi(platformApi)
        const site = await getSite(siteId.value)
        serverAddress = site.site_server.address
        siteVersion = site.version
      }
      serverAddress = resolveSiteServerAddress(serverAddress)
      const apiClient = new PSApi({
        baseUrl: `${serverAddress}/api/`,
        userToken: props.authBypassToken || store.auth.token,
        responseInterceptors: [...plainResponseInterceptors],
      })
      const api = useSiteApi(apiClient)
      getFn = api.getSiteVersion
      updateFn = api.updateSite
      submitFn = api.submitOperations
      operationsFn = api.getOperations
    }
    clientId = getClientId()
    setCollaborationClientId(clientId)
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', persistPending)
    }
    return serverAddress ? { serverAddress, siteVersion } : undefined
  }

  // The preview page reads unsaved content from here
  const updateLocalCache = (contentUpdatedAt: number | undefined) => {
    if (!pendingSnapshot) return
    store.site.setSite(pendingSnapshot)
    setLocalContentUpdatedAt(siteId.value, contentUpdatedAt)
  }

  const markClean = () => {
    contentDirty.value = false
    pendingBatch = undefined
    removeSession('pending')
  }

  const rebasePending = (canonical: IStoredSite, pendingCommands: WireCommand[]) => {
    try {
      return applyWireCommands(canonical, pendingCommands)
    } catch (error) {
      outboundPaused = true
      preserveRecovery(
        error instanceof Error ? error.message : String(error),
        pendingCommands,
      )
      saveError.value = {
        status: 409,
        code: 'CollaborationConflict',
        message: 'Remote changes conflict with unsaved work in this tab.',
      }
      throw error
    }
  }

  // Fetch operations after the canonical revision and merge them under the local edits.
  // Any inconsistency in the log (gap, compaction, replaced content, version switch)
  // flags a full snapshot reload instead of guessing.
  const syncOperations = (): Promise<void> => {
    if (syncPromise) return syncPromise
    syncPromise = (async () => {
      if (!apiSnapshot || !operationsFn) return
      const revision = revisionOf(apiSnapshot)
      const response = await operationsFn(siteId.value, revision)
      if (!apiSnapshot || revisionOf(apiSnapshot) !== revision) return
      const operations = response.operations
        .filter((operation) => operation.revision > revision)
        .sort((left, right) => left.revision - right.revision)
      const contiguous = operations.every(
        (operation, index) => operation.revision === revision + 1 + index,
      )
      if (
        response.snapshot_required ||
        response.operation_floor > revision + 1 ||
        response.current_revision < revision ||
        !contiguous ||
        (!operations.length && response.current_revision > revision)
      ) {
        snapshotRefreshRequired = true
        return
      }
      if (!operations.length) return

      const pendingCommands = pendingSnapshot
        ? diffStoredSites(apiSnapshot, pendingSnapshot)
        : []
      let canonical: IStoredSite
      try {
        canonical = applyAcceptedOperations(apiSnapshot, operations)
      } catch (error) {
        console.log('Operation replay failed, reloading site:', error)
        snapshotRefreshRequired = true
        return
      }
      canonical.operation_floor = response.operation_floor
      canonical.content_updated_at = response.content_updated_at
      const rebased = rebasePending(canonical, pendingCommands)
      apiSnapshot = canonical
      pendingSnapshot = { ...rebased, ...privateState() }
      pendingSnapshot.content_updated_at = response.content_updated_at
      contentDirty.value =
        pendingCommands.length > 0 &&
        diffStoredSites(apiSnapshot, pendingSnapshot).length > 0
      if (!contentDirty.value) markClean()
      updateLocalCache(response.content_updated_at)
      if (operations.some((operation) => operation.client_id !== clientId)) {
        remoteChangePending = true
      }
    })().finally(() => {
      syncPromise = undefined
    })
    return syncPromise
  }

  const recordSaveError = (error: unknown) => {
    const apiError = toApiError(error) ?? {
      status: 0,
      code: 'CollaborationNetworkError',
      message: error instanceof Error ? error.message : String(error),
    }
    // rebasePending already recorded the focused 409 and recovery snapshot
    if (!(outboundPaused && saveError.value?.code === 'CollaborationConflict')) {
      saveError.value = apiError
    }
    if (apiError.status === 409 || apiError.code === 'CollaborationConflict') {
      outboundPaused = true
      preserveRecovery(apiError.message ?? apiError.code)
    } else {
      persistPending()
    }
  }

  const submitPending = async () => {
    if (!apiSnapshot || !pendingSnapshot || outboundPaused) return
    saveError.value = undefined
    requestInFlight.value = true
    try {
      await syncOperations()
      if (snapshotRefreshRequired || outboundPaused || !apiSnapshot || !pendingSnapshot) {
        return
      }
      const commands = diffStoredSites(apiSnapshot, pendingSnapshot)
      if (!commands.length) {
        markClean()
        return
      }
      if (
        !pendingBatch ||
        pendingBatch.base_revision !== revisionOf(apiSnapshot) ||
        JSON.stringify(pendingBatch.commands) !== JSON.stringify(commands)
      ) {
        pendingBatch = {
          protocol_version: collaborationProtocolVersion,
          batch_id: randomId(),
          client_id: clientId,
          base_revision: revisionOf(apiSnapshot),
          commands,
        }
      }
      const result = await submitFn(siteId.value, pendingBatch)
      pendingSnapshot.content_updated_at = result.content_updated_at
      lastSavedAt.value = Date.now()
      await syncOperations()
    } catch (error) {
      recordSaveError(error)
    } finally {
      requestInFlight.value = false
    }
  }

  // Imports, templates and site resets replace the whole document. The server bumps
  // the revision without logging operations, so other tabs reload the snapshot.
  const replaceSnapshot = async () => {
    if (!pendingSnapshot) return
    saveError.value = undefined
    requestInFlight.value = true
    try {
      const stored = pendingSnapshot
      const payload: IUpdateSiteApiRequest = {}
      for (const section of documentSections) {
        payload[section] = stored[section] ?? undefined
      }
      const result = await updateFn(siteId.value, payload)
      apiSnapshot = {
        ...stored,
        revision: result.revision,
        operation_floor: result.operation_floor ?? 0,
        content_updated_at: result.content_updated_at,
      }
      pendingSnapshot = { ...apiSnapshot, ...privateState() }
      snapshotRefreshRequired = result.revision === undefined
      outboundPaused = false
      markClean()
      updateLocalCache(result.content_updated_at)
      lastSavedAt.value = Date.now()
    } catch (error) {
      recordSaveError(error)
    } finally {
      requestInFlight.value = false
    }
  }

  // Writes are serialized so a debounced submit and an immediate save never race
  const enqueue = (write: () => Promise<void>): Promise<void> => {
    const run: Promise<void> = (updatePromise ?? Promise.resolve())
      .then(write)
      .finally(() => {
        if (updatePromise === run) updatePromise = undefined
      })
    updatePromise = run
    return run
  }

  const startSaveTimer = (timeout: number) => {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveTimer = undefined
      void enqueue(submitPending)
    }, timeout)
  }

  const save = async (site: ISite, options?: ISiteSaveOptions): Promise<void> => {
    if (!store.version.editingEnabled.value) {
      siteSaveAlert.value = SiteSaveAlert.Disabled
      return
    }
    const stored = storeSite(site)
    stored.content_updated_at =
      site.content_updated_at ?? pendingSnapshot?.content_updated_at
    savePrivateState(stored)
    pendingSnapshot = stored
    updateLocalCache(Date.now())
    if (options?.snapshot) {
      contentDirty.value = true
      await enqueue(replaceSnapshot)
      return
    }
    // A cheap conservative check; the debounced submit computes the real diff
    contentDirty.value =
      !!apiSnapshot &&
      documentSections.some((section) => stored[section] !== apiSnapshot?.[section])
    if (!contentDirty.value) return
    if (options?.immediate) {
      if (saveTimer) {
        clearTimeout(saveTimer)
        saveTimer = undefined
      }
      await enqueue(submitPending)
    } else {
      startSaveTimer(3000)
    }
  }

  // Editor state and undo history are private to the tab
  const saveEditor = async (editor: IEditorContext): Promise<void> => {
    if (!store.version.editingEnabled.value) return
    const serialized = serializeEditor(editor)
    if (!serialized || !pendingSnapshot) return
    const editorValue = JSON.stringify(serialized)
    pendingSnapshot.editor = editorValue
    store.site.setEditor(editorValue)
    savePrivateState(pendingSnapshot)
  }

  const activeVersionId = () => store.version.activeVersionId.value ?? 'latest'

  const restoreFull = async (): Promise<ISiteRestore | undefined> => {
    const versionId = activeVersionId()
    const siteData = await getFn(siteId.value, versionId)
    if (!siteData) return undefined
    loadedVersionId = versionId
    const data = {
      ...siteData,
      updated_at: siteData.updated_at.toString(),
      content_updated_at: siteData.content_updated_at,
      revision: siteData.revision ?? 0,
      operation_floor: siteData.operation_floor ?? 0,
    }
    const restored = restoreSiteHelper(data)
    apiSnapshot = storeSite(restored.site)
    apiSnapshot.revision = data.revision
    apiSnapshot.operation_floor = data.operation_floor
    apiSnapshot.content_updated_at = data.content_updated_at
    const privateValue = readSession<PrivateState>('private')
    pendingSnapshot = { ...apiSnapshot, ...privateValue }
    // A fresh canonical load reopens the outbound path; a persisted pending diff that
    // still conflicts is discarded into the recovery slot
    outboundPaused = false
    snapshotRefreshRequired = false
    remoteChangePending = false
    markClean()
    const persisted = readSession<IPersistedPending>('pending')
    if (persisted?.commands.length) {
      try {
        pendingSnapshot = {
          ...applyWireCommands(apiSnapshot, persisted.commands),
          ...privateValue,
        }
        pendingBatch = persisted.batch
        contentDirty.value = diffStoredSites(apiSnapshot, pendingSnapshot).length > 0
        if (contentDirty.value) startSaveTimer(3000)
      } catch (error) {
        console.log('Discarding conflicting unsaved edits after reload:', error)
        preserveRecovery(
          error instanceof Error ? error.message : String(error),
          persisted.commands,
        )
        pendingSnapshot = { ...apiSnapshot, ...privateValue }
      }
    }
    updateLocalCache(data.content_updated_at)
    return restoreSiteHelper(pendingSnapshot)
  }

  const restore = async (checkUpdateKey?: number): Promise<ISiteRestore | undefined> => {
    try {
      if (
        !apiSnapshot ||
        checkUpdateKey === undefined ||
        snapshotRefreshRequired ||
        activeVersionId() !== loadedVersionId
      ) {
        return await restoreFull()
      }
      // Older versions are read-only; operations are logged against the latest version
      if (loadedVersionId !== 'latest') return undefined
      try {
        await syncOperations()
      } catch (error) {
        if (toApiError(error)?.status === 401) throw error
        // A local rebase conflict is surfaced through saveError, not by replacing the site
        console.log('Collaboration sync failed:', error)
        return undefined
      }
      if (snapshotRefreshRequired) return await restoreFull()
      if (remoteChangePending && pendingSnapshot) {
        remoteChangePending = false
        return restoreSiteHelper(pendingSnapshot)
      }
      return undefined
    } catch (error) {
      console.log('Restore failed:', error)
      const apiError = toApiError(error)
      if (apiError?.status === 401) throw error
      return restoreSiteError(parseApiErrorKey(apiError))
    }
  }

  const setUpdateKey = (_key: string | undefined) => {
    // Collaborative writes use monotonic revisions instead of timestamp update keys.
  }

  return {
    saveState,
    siteId,
    saveError,
    lastSavedAt,
    initialize,
    save,
    saveEditor,
    restore,
    setUpdateKey,
  }
}
