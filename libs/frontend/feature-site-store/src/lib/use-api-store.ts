import { useLocalSiteApi, usePlatformSiteApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { serializeEditor, storeSite } from '@pubstudio/frontend/util-site-store'
import { IApiError } from '@pubstudio/shared/type-api'
import {
  IGetSiteApiRequest,
  IGetSiteApiResponse,
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { IEditorContext, ISite } from '@pubstudio/shared/type-site'
import {
  ISiteRestore,
  ISiteStore,
  IStoredSiteDirty,
  SiteSaveState,
} from '@pubstudio/shared/type-site-store'
import { computed, inject, ref } from 'vue'
import { restoreSiteError } from './restore-site-error'
import { restoreSiteHelper } from './restore-site-helper'

export interface IUseApiStoreProps {
  siteId: string
  siteApiUrl?: string
}

interface IUpdateApiOptions {
  keepalive?: boolean
  clearTimer?: boolean
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
    const { keepalive, clearTimer } = options
    saveError.value = undefined
    const site = store.site.getSite.value
    try {
      const payload: IUpdateSiteApiRequest = {}
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
        await updateFn(siteId.value, payload, keepalive)
      }
      dirty.value = dirtyDefault()
      if (clearTimer) {
        // `clearTimeout` is not called here because we want to avoid canceling any queued updates
        // when the previous update has completed.
        saveTimer = undefined
      }
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
      updateApi({
        clearTimer: true,
      })
    }, timeout)
  }

  // Save the Site to localstorage, and start the API update timer
  // The API timer is reset if currently active
  const save = async (site: ISite, immediate?: boolean): Promise<void> => {
    const storedSite = storeSite(site)
    store.site.setSite(storedSite)
    let changed = false
    for (const key in site) {
      const k = key as keyof IStoredSiteDirty
      dirty.value[k] = site[k] !== store.site[k]?.value
      if (dirty.value[k]) {
        changed = true
      }
    }
    if (changed) {
      if (immediate) {
        await updateApi({
          keepalive: true,
          clearTimer: false,
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
      dirty.value.editor = editorStr !== store.site.editor?.value
      if (dirty.value.editor) {
        store.site.setEditor(editorStr)
        // The editor changes often, so we don't want to over-burden the API
        // But Site changes are more critical, so we shouldn't override the shorter timer
        startSaveTimer(5000, false)
      }
    }
  }

  const restore = async (updateKey?: string): Promise<ISiteRestore | undefined> => {
    try {
      const siteData = await getFn(siteId.value, { update_key: updateKey })
      if (!siteData) {
        return undefined
      }
      const data = {
        ...siteData,
        updated_at: siteData?.updated_at.toString(),
      }
      return restoreSiteHelper(data)
    } catch (e) {
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
