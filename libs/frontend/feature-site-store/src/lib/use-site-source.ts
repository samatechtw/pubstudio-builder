import { usePlatformSiteApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { site } from '@pubstudio/frontend/feature-site-source'
import { PSApi } from '@pubstudio/frontend/util-api'
import { loadSiteLanguage } from '@pubstudio/frontend/util-site-deserialize'
import { IUpdateSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import {
  CssPseudoClassType,
  IEditorContext,
  IPage,
  ISite,
  ISiteRestore,
  ISiteStore,
  SiteSaveState,
} from '@pubstudio/shared/type-site'
import { plainResponseInterceptors } from '@pubstudio/shared/util-web-site-api'
import { computed, ComputedRef, inject, reactive, Reactive, Ref, ref } from 'vue'
import { getActivePage } from './get-active-page'
import { migrateSite } from './migrate-site'

// This file is here, instead of frontend/feature-site-source, to decouple the `site`
// instance from the dependencies required by this lib.

export interface IUseSiteSource {
  site: Ref<ISite>
  editor: ComputedRef<IEditorContext | undefined>
  activePage: Ref<IPage | undefined>
  currentPseudoClass: ComputedRef<CssPseudoClassType>
  siteError: Ref<string | undefined>
  apiSiteId: Ref<string | undefined>
  apiSite: PSApi | undefined
  siteStore: Reactive<ISiteStore>
  isSaving: ComputedRef<boolean>
  isSiteApi: ComputedRef<boolean>
  initializeSite: (options: IInitializeSiteOptions) => Promise<string | undefined>
  syncUpdateKey: (updateBody: IUpdateSiteApiResponse) => void
  replaceSite: (newSite: ISite) => void
  setRestoredSite: (restored: ISiteRestore | undefined) => void
}

export interface IInitializeSiteOptions {
  store: ISiteStore
  siteId: string | undefined
  userToken?: Ref<string | null>
}

const siteStore = reactive({}) as Reactive<ISiteStore>
let restoredSite: ISiteRestore
const siteError = ref<string>()
const apiSiteId = ref<string>()
let apiSite: PSApi

const editor = computed(() => {
  return site.value.editor
})

const isSaving = computed(() => {
  // TODO -- figure out how to avoid nested ComputedRef in `siteStore` Ref
  const saveState = siteStore.saveState as unknown as SiteSaveState
  return saveState === SiteSaveState.Saving || saveState === SiteSaveState.SavingEditor
})

const activePage = computed(() => {
  return getActivePage(site.value)
})

const currentPseudoClass = computed<CssPseudoClassType>(
  () => site.value.editor?.cssPseudoClass ?? 'default',
)

const isSiteApi = computed(() => {
  const siteId = apiSiteId.value
  return !!siteId && siteId !== 'scratch' && siteId !== 'identity'
})

export const useSiteSource = (): IUseSiteSource => {
  const platformApi = inject(ApiInjectionKey) as PSApi

  const setRestoredSite = (restored: ISiteRestore | undefined) => {
    if (restored) {
      restoredSite = restored
      replaceSite(restoredSite.site)
      siteError.value = restoredSite.error
    }
  }

  const replaceSite = (newSite: ISite) => {
    loadSiteLanguage(newSite)
    site.value = newSite
    if (site.value.editor) {
      site.value.editor.store = siteStore as unknown as ISiteStore
    }
    // Migrate site version if necessary
    if (site.value) {
      const migrated = migrateSite(site.value)
      // If a paid site was migrated to a new version, sync with the platform API
      if (apiSiteId.value && isSiteApi.value && migrated) {
        const { updateSite } = usePlatformSiteApi(platformApi)
        updateSite(apiSiteId.value, { version: site.value.version })
      }
    }
  }

  const initializeSite = async (
    options: IInitializeSiteOptions,
  ): Promise<string | undefined> => {
    const { siteId, store, userToken } = options
    apiSiteId.value = siteId
    Object.assign(siteStore, store)

    const initInfo = await siteStore.initialize()
    if (initInfo) {
      apiSite = new PSApi({
        baseUrl: `${initInfo.serverAddress}/api/`,
        userToken,
        responseInterceptors: [...plainResponseInterceptors],
      })
    }
    const restored = await siteStore.restore()
    setRestoredSite(restored)
    return initInfo?.serverAddress
  }

  // When a site is updated outside the siteStore, the update_key needs to be synced.
  // Otherwise, the next `save` call will fail with the outdated update_key
  const syncUpdateKey = (updateBody: IUpdateSiteApiResponse) => {
    site.value.preview_id = updateBody.preview_id
    siteStore.setUpdateKey(updateBody.updated_at.toString())
  }

  return {
    initializeSite,
    syncUpdateKey,
    replaceSite,
    setRestoredSite,
    apiSite,
    apiSiteId,
    siteStore,
    isSaving,
    isSiteApi,
    site,
    editor,
    currentPseudoClass,
    activePage,
    siteError,
  }
}
