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
import { builderConfig } from '@pubstudio/frontend/util-config'
import { serializeEditor, storeSite } from '@pubstudio/frontend/util-site-store'
import { IApiError } from '@pubstudio/shared/type-api'
import {
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import {
  IEditorContext,
  ISite,
  ISiteRestore,
  ISiteSaveOptions,
  ISiteStore,
  ISiteStoreInitializeResult,
  IStoredSiteDirty,
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

interface IUpdateApiOptions {
  keepalive?: boolean
  ignoreUpdateKey?: boolean
}

// TODO - The intent is to refresh the page when the API store is affected, otherwise we lose track
// of the update key and the next update-site call fails. It would be better to find a way
// to refresh the key or ignore it for the next update-site call after HMR.
if (import.meta.hot) {
  import.meta.hot.decline()
}

export const useApiStore = (props: IUseApiStoreProps): ISiteStore => {
  const platformApi = inject(ApiInjectionKey) as PSApi
  const siteId = ref(props.siteId)
  const saveError = ref<IApiError | undefined>()
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let getFn: GetSiteVersionFn
  let updateFn: (
    siteId: string,
    payload: IUpdateSiteApiRequest,
    keepalive?: boolean,
  ) => Promise<IUpdateSiteApiResponse>

  const dirtyDefault = () => ({
    name: false,
    version: false,
    defaults: false,
    context: false,
    pages: false,
    pageOrder: false,
    editor: false,
    history: false,
  })

  const dirty = ref<IStoredSiteDirty>(dirtyDefault())
  // Used to ensure site data from another tab/browser isn't overwritten
  const updateKey = ref<string | undefined>()

  const saveState = computed(() => {
    if (dirty.value.editor) {
      return SiteSaveState.SavingEditor
    }
    return Object.values(dirty.value).some((d) => d)
      ? SiteSaveState.Saving
      : SiteSaveState.Saved
  })

  // Set up the get/update functions for syncing to the Platform API (local site)
  // or Site API (free/paid site)
  const initialize = async (): Promise<ISiteStoreInitializeResult | undefined> => {
    let serverAddress: string | undefined
    let siteVersion = builderConfig.siteFormatVersion
    if (siteId.value === 'identity') {
      const platformSiteApi = useLocalSiteApi(platformApi)
      siteId.value = store.user.identity.value.id
      getFn = platformSiteApi.getLocalSiteVersion
      updateFn = platformSiteApi.updateLocalSite
    } else {
      if (props.siteApiUrl) {
        serverAddress = props.siteApiUrl
      } else {
        // Get site server address from Platform API
        const { getSite } = usePlatformSiteApi(platformApi)
        const site = await getSite(siteId.value)
        serverAddress = site.site_server.address
        siteVersion = site.site_version
      }
      // Convert cluster URLs for dev/CI
      serverAddress =
        {
          'http://site-api1:3100': 'http://127.0.0.1:3100',
          'http://site-api1:3110': 'http://127.0.0.1:3110',
        }[serverAddress] ?? serverAddress

      const api = new PSApi({
        baseUrl: `${serverAddress}/api/`,
        userToken: props.authBypassToken || store.auth.token,
        responseInterceptors: [...plainResponseInterceptors],
      })

      const siteApi = useSiteApi(api)
      getFn = siteApi.getSiteVersion
      updateFn = siteApi.updateSite
      return {
        serverAddress,
        siteVersion,
      }
    }
    return undefined
  }

  // Post the updated Site fields to the API
  const updateApi = async (options: IUpdateApiOptions) => {
    const { keepalive } = options
    saveError.value = undefined
    const site = store.site.getSite.value
    try {
      const payload: IUpdateSiteApiRequest = {}
      if (updateKey.value && !options.ignoreUpdateKey) {
        payload.update_key = updateKey.value
      }
      let hasUpdates = false
      for (const key in dirty.value) {
        const k = key as keyof IStoredSiteDirty
        const val = site[k]
        if (dirty.value[k] && val !== null) {
          payload[k] = val
          hasUpdates = true
        }
      }
      if (hasUpdates) {
        const result = await updateFn(siteId.value, payload, keepalive)
        if (result.content_updated_at) {
          setLocalContentUpdatedAt(result.content_updated_at)
        }
        updateKey.value = result.updated_at.toString()
      }
      dirty.value = dirtyDefault()
    } catch (e) {
      saveError.value = toApiError(e)
      console.log('Save site API call fail:', e)
    }
  }

  const startSaveTimer = (timeout: number, override = true) => {
    if (saveTimer) {
      if (!override) {
        return
      }
      clearTimeout(saveTimer)
    }
    saveTimer = setTimeout(() => {
      updateApi({})
      saveTimer = undefined
    }, timeout)
  }

  // Save the Site to localstorage, and start the API update timer
  // The API timer is reset if currently active
  const save = async (site: ISite, options?: ISiteSaveOptions): Promise<void> => {
    // Live site cannot be updated when a draft exists
    if (!store.version.editingEnabled.value) {
      siteSaveAlert.value = SiteSaveAlert.Disabled
      return
    }
    const storedSite = storeSite(site)
    let changed = false
    for (const key in site) {
      const k = key as keyof IStoredSiteDirty
      dirty.value[k] =
        options?.forceUpdate || dirty.value[k] || storedSite[k] !== store.site[k]?.value
      if (dirty.value[k]) {
        changed = true
      }
    }
    store.site.setSite(storedSite)
    setLocalContentUpdatedAt(Date.now())
    if (changed) {
      if (options?.immediate) {
        if (saveTimer) {
          clearTimeout(saveTimer)
          saveTimer = undefined
        }
        await updateApi({
          // TODO -- figure out the exact limitations. Chrome seems to fail when keepalive=true and the
          // request is > 64kB, but only when importing a site?
          // Either check the request size and set keepalive accordingly, or keep it false.
          // See https://fetch.spec.whatwg.org/#http-network-or-cache-fetch
          keepalive: false,
          ignoreUpdateKey: options?.ignoreUpdateKey,
        })
      } else {
        startSaveTimer(3000)
      }
    }
  }

  const saveEditor = async (editor: IEditorContext): Promise<void> => {
    if (!store.version.editingEnabled.value) {
      return
    }
    const serialized = serializeEditor(editor)
    if (serialized) {
      const editorStr = JSON.stringify(serialized)
      dirty.value.editor = dirty.value.editor || editorStr !== store.site.editor?.value
      if (dirty.value.editor) {
        store.site.setEditor(editorStr)
        // The editor changes often, so we don't want to over-burden the API
        // But Site changes are more critical, so we shouldn't override the shorter timer
        startSaveTimer(5000, false)
      }
    }
  }

  const restore = async (checkUpdateKey?: number): Promise<ISiteRestore | undefined> => {
    try {
      const versionId = store.version.activeVersionId.value ?? 'latest'
      const siteData = await getFn(siteId.value, versionId, {
        update_key: checkUpdateKey,
      })
      if (!siteData) {
        return undefined
      }
      updateKey.value = siteData?.updated_at.toString()
      const data = {
        ...siteData,
        updated_at: updateKey.value,
        content_updated_at: siteData?.content_updated_at,
      }
      setLocalContentUpdatedAt(siteData?.content_updated_at)
      return restoreSiteHelper(data)
    } catch (e) {
      console.log('Restore failed:', e)
      const err = toApiError(e)
      if (err?.status === 401) {
        throw e
      }
      return restoreSiteError(parseApiErrorKey(toApiError(e)))
    }
  }

  // Manually set the update key, for example when a new draft/version is created
  const setUpdateKey = (key: string | undefined) => {
    updateKey.value = key
  }

  return {
    siteId,
    saveState,
    saveError,
    initialize,
    save,
    saveEditor,
    restore,
    setUpdateKey,
  }
}
