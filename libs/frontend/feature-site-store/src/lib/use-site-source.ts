import { site } from '@pubstudio/frontend/feature-site-source'
import { ISite } from '@pubstudio/shared/type-site'
import {
  ISiteRestore,
  ISiteStore,
  SiteSaveState,
} from '@pubstudio/shared/type-site-store'
import { computed, ComputedRef, Ref, ref } from 'vue'

// This file is here, instead of frontend/feature-site-source, to decouple the `site`
// instance from the dependencies required by this lib.

export interface IUseSiteSource {
  site: Ref<ISite>
  siteError: Ref<string | undefined>
  apiSiteId: Ref<string | undefined>
  siteStore: Ref<ISiteStore>
  isSaving: ComputedRef<boolean>
  initializeSite: (options: IInitializeSiteOptions) => Promise<void>
  checkOutdated: () => Promise<void>
}

export interface IInitializeSiteOptions {
  store: ISiteStore
  siteId: string | undefined
}

const siteStore = ref() as Ref<ISiteStore>
let restoredSite: ISiteRestore
const siteError = ref<string>()
const apiSiteId = ref<string>()

const isSaving = computed(() => {
  // TODO -- figure out how to avoid nested ComputedRef in `siteStore` Ref
  const saveState = siteStore.value.saveState as unknown as SiteSaveState
  return saveState === SiteSaveState.Saving || saveState === SiteSaveState.SavingEditor
})

export const useSiteSource = (): IUseSiteSource => {
  const initializeSite = async (options: IInitializeSiteOptions) => {
    const { siteId, store } = options
    siteStore.value = {
      ...store,
    }

    await siteStore.value.initialize()
    const restored = await siteStore.value.restore()
    if (restored) {
      restoredSite = restored
      site.value = restoredSite.site
      apiSiteId.value = siteId
      siteError.value = restoredSite.error
    }
  }

  const checkOutdated = async () => {
    const restored = await siteStore.value.restore(site.value.updated_at)
    if (restored) {
      console.log('Site updated:', site.value.updated_at)
      restoredSite = restored
      site.value = restoredSite.site
      siteError.value = restoredSite.error
    } else {
      console.log('No site updates')
    }
  }

  return {
    initializeSite,
    checkOutdated,
    apiSiteId,
    siteStore,
    isSaving,
    site,
    siteError,
  }
}
