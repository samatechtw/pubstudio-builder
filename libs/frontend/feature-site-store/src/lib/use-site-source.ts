import { site } from '@pubstudio/frontend/feature-site-source'
import { PSApi } from '@pubstudio/frontend/util-api'
import { IUpdateSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import {
  IPage,
  ISite,
  ISiteRestore,
  ISiteStore,
  SiteSaveState,
} from '@pubstudio/shared/type-site'
import { plainResponseInterceptors } from '@pubstudio/shared/util-web-site-api'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { getActivePage } from './get-active-page'

// This file is here, instead of frontend/feature-site-source, to decouple the `site`
// instance from the dependencies required by this lib.

export interface IUseSiteSource {
  site: Ref<ISite>
  activePage: Ref<IPage | undefined>
  siteError: Ref<string | undefined>
  apiSiteId: Ref<string | undefined>
  apiSite: PSApi | undefined
  siteStore: Ref<ISiteStore>
  isSaving: ComputedRef<boolean>
  isSiteApi: ComputedRef<boolean>
  initializeSite: (options: IInitializeSiteOptions) => Promise<string | undefined>
  checkOutdated: () => Promise<void>
  syncUpdateKey: (updateBody: IUpdateSiteApiResponse) => void
  replaceSite: (newSite: ISite) => void
  setRestoredSite: (restored: ISiteRestore | undefined) => void
}

export interface IInitializeSiteOptions {
  store: ISiteStore
  siteId: string | undefined
  userToken?: Ref<string | null>
}

const siteStore = ref() as Ref<ISiteStore>
let restoredSite: ISiteRestore
const siteError = ref<string>()
const apiSiteId = ref<string>()
let apiSite: PSApi

const isSaving = computed(() => {
  // TODO -- figure out how to avoid nested ComputedRef in `siteStore` Ref
  const saveState = siteStore.value.saveState as unknown as SiteSaveState
  return saveState === SiteSaveState.Saving || saveState === SiteSaveState.SavingEditor
})

const activePage = computed(() => {
  return getActivePage(site.value)
})

const isSiteApi = computed(() => {
  const siteId = apiSiteId.value
  return !!siteId && siteId !== 'scratch' && siteId !== 'identity'
})

export const useSiteSource = (): IUseSiteSource => {
  const setRestoredSite = (restored: ISiteRestore | undefined) => {
    if (restored) {
      restoredSite = restored
      replaceSite(restoredSite.site)
      siteError.value = restoredSite.error
    }
  }

  const replaceSite = (newSite: ISite) => {
    site.value = newSite
    if (site.value.editor) {
      site.value.editor.store = siteStore.value
    }
  }

  const initializeSite = async (
    options: IInitializeSiteOptions,
  ): Promise<string | undefined> => {
    const { siteId, store, userToken } = options
    apiSiteId.value = siteId
    siteStore.value = {
      ...store,
    }

    const serverAddress = await siteStore.value.initialize()
    if (serverAddress) {
      apiSite = new PSApi({
        baseUrl: `${serverAddress}/api/`,
        userToken,
        responseInterceptors: [...plainResponseInterceptors],
      })
    }
    const restored = await siteStore.value.restore()
    setRestoredSite(restored)
    return serverAddress
  }

  // When a site is updated outside the siteStore, the update_key needs to be synced.
  // Otherwise, the next `save` call will fail with the outdated update_key
  const syncUpdateKey = (updateBody: IUpdateSiteApiResponse) => {
    site.value.preview_id = updateBody.preview_id
    siteStore.value.setUpdateKey(updateBody.updated_at.toString())
  }

  const checkOutdated = async () => {
    if (!site.value) {
      return
    }
    const restored = await siteStore.value.restore(site.value.content_updated_at)
    setRestoredSite(restored)
    if (restored) {
      console.log('Site updated:', site.value.content_updated_at)
    } else {
      console.log('No site updates')
    }
  }

  return {
    initializeSite,
    syncUpdateKey,
    checkOutdated,
    replaceSite,
    setRestoredSite,
    apiSite,
    apiSiteId,
    siteStore,
    isSaving,
    isSiteApi,
    site,
    activePage,
    siteError,
  }
}
