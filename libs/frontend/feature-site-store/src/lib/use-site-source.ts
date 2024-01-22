import { site } from '@pubstudio/frontend/feature-site-source'
import {
  ISite,
  ISiteRestore,
  ISiteStore,
  SiteSaveState,
} from '@pubstudio/shared/type-site'
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
  const setRestoredSite = (restored: ISiteRestore | undefined) => {
    if (restored) {
      restoredSite = restored
      site.value = restoredSite.site
      if (site.value.editor) {
        site.value.editor.store = siteStore.value
      }
      siteError.value = restoredSite.error
    }
  }

  const initializeSite = async (options: IInitializeSiteOptions) => {
    const { siteId, store } = options
    apiSiteId.value = siteId
    siteStore.value = {
      ...store,
    }

    await siteStore.value.initialize()
    const restored = await siteStore.value.restore()
    setRestoredSite(restored)
  }

  const checkOutdated = async () => {
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
    checkOutdated,
    apiSiteId,
    siteStore,
    isSaving,
    site,
    siteError,
  }
}
