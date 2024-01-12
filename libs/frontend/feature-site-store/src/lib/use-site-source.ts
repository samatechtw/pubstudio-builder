import { site } from '@pubstudio/frontend/feature-site-source'
import {
  ISite,
  ISiteRestore,
  ISiteStore,
  SiteSaveState,
} from '@pubstudio/shared/type-site'
import { serializeSiteContext, serializePage } from '@pubstudio/frontend/util-site-store'
import { store } from '@pubstudio/frontend/data-access-web-store'
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
  // For scratch site.
  let oldScratchSite = ''
  // For API site.
  let oldRestored: ISiteRestore | undefined = undefined

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

  // The periodic fetch on the preview page will reset page states, such as
  // input values and styles added via behavior code. Therefore, we should
  // only replace the current site when there are changes in content that
  // will affect the rendered output.
  const checkOutdated = async () => {
    if (!apiSiteId.value) {
      // Scratch site
      await checkScratchSiteOutdated()
    } else {
      // API site
      await checkApiSiteOutdated()
    }
  }

  // Only replace the current site with a new one when content changes.
  const checkScratchSiteOutdated = async () => {
    const currentScratchSite = localStorage.getItem('scratch-site-store') ?? ''
    if (oldScratchSite !== currentScratchSite) {
      if (currentScratchSite) {
        const moduleState = JSON.parse(currentScratchSite)
        store.scratchSite.setSite(moduleState.state)
      }
      oldScratchSite = currentScratchSite

      const restored = await siteStore.value.restore(site.value.updated_at)
      if (restored) {
        setRestoredSite(restored)
        console.log('Site updated:', site.value.updated_at)
      }
    }
  }

  // Only replace the current site with a new one when content changes.
  const checkApiSiteOutdated = async () => {
    const restored = await siteStore.value.restore(site.value.updated_at)

    if (restored) {
      const siteChanged = checkSitesChanged(restored)
      oldRestored = restored

      if (siteChanged) {
        setRestoredSite(restored)
        console.log('Site updated:', site.value.updated_at)
        return
      }
    } else {
      oldRestored = restored
    }

    console.log('No site updates')
  }

  // Only compare properties that affects the rendered output of a site.
  const checkSitesChanged = (newRestored: ISiteRestore) => {
    if (!oldRestored || !oldRestored.error !== !newRestored.error) {
      return true
    }

    // Check site context.
    const oldContext = serializeSiteContext(oldRestored.site.context)
    const newContext = serializeSiteContext(newRestored.site.context)
    if (JSON.stringify(oldContext) !== JSON.stringify(newContext)) {
      return true
    }

    // Check site defaults.
    if (
      JSON.stringify(oldRestored.site.defaults) !==
      JSON.stringify(newRestored.site.defaults)
    ) {
      return true
    }

    // Check pages.
    for (const oldRoute in oldRestored.site.pages) {
      if (!(oldRoute in newRestored.site.pages)) {
        return true
      }
      const oldPage = serializePage(oldRestored.site.pages[oldRoute])
      const newPage = serializePage(newRestored.site.pages[oldRoute])
      if (JSON.stringify(oldPage) !== JSON.stringify(newPage)) {
        return true
      }
    }

    // Everything is the same.
    return false
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
