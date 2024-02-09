import { useLocalSiteApi, usePlatformSiteApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { restoreSiteError, restoreSiteHelper } from '@pubstudio/frontend/util-command'
import { serializeEditor, storeSite } from '@pubstudio/frontend/util-site-store'
import { IApiError } from '@pubstudio/shared/type-api'
import {
  IGetSiteApiRequest,
  IGetSiteApiResponse,
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import {
  IEditorContext,
  ISite,
  ISiteRestore,
  ISiteSaveOptions,
  ISiteStore,
  IStoredSiteDirty,
  SiteSaveState,
} from '@pubstudio/shared/type-site'
import { computed, inject, ref } from 'vue'

export interface IUseApiStoreProps {
  siteId: string
  siteApiUrl?: string
}

interface IUpdateApiOptions {
  keepalive?: boolean
  ignoreUpdateKey?: boolean
}

export const useApiStore = (props: IUseApiStoreProps): ISiteStore => {
  const platformApi = inject(ApiInjectionKey) as PSApi
  const siteId = ref(props.siteId)
  const saveError = ref<IApiError | undefined>()
  let saveTimer: ReturnType<typeof setTimeout> | undefined
  let getFn: (
    siteId: string,
    query?: IGetSiteApiRequest,
  ) => Promise<IGetSiteApiResponse | undefined>
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
  const initialize = async () => {
    if (siteId.value === 'identity') {
      const platformSiteApi = useLocalSiteApi(platformApi)
      siteId.value = store.user.identity.value.id
      getFn = platformSiteApi.getLocalSite
      updateFn = platformSiteApi.updateLocalSite
    } else {
      let serverAddress: string
      if (props.siteApiUrl) {
        serverAddress = props.siteApiUrl
      } else {
        // Get site server address from Platform API
        const { getSite } = usePlatformSiteApi(platformApi)
        const site = await getSite(siteId.value)
        serverAddress = site.site_server.address
      }

      const siteApi = useSiteApi({ store, serverAddress })
      getFn = siteApi.getSite
      updateFn = siteApi.updateSite
    }
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
      const siteData = await getFn(siteId.value, { update_key: checkUpdateKey })
      if (!siteData) {
        return undefined
      }
      updateKey.value = siteData?.updated_at.toString()
      const data = {
        ...siteData,
        updated_at: updateKey.value,
        content_updated_at: siteData?.content_updated_at,
      }
      return restoreSiteHelper(data)
    } catch (e) {
      console.log('Restore failed:', e)
      return restoreSiteError(parseApiErrorKey(toApiError(e)))
    }
  }

  return {
    siteId,
    saveState,
    saveError,
    initialize,
    save,
    saveEditor,
    restore,
  }
}
