import { site } from '@pubstudio/frontend/feature-site-source'
import { ISite } from '@pubstudio/shared/type-site'
import { ISiteRestore, ISiteStore } from '@pubstudio/shared/type-site-store'
import { Ref, ref } from 'vue'
import { useSiteStore } from './use-site-store'

// This file is here, instead of frontend/feature-site-source, to decouple the `site`
// instance from the dependencies required by this lib.

export interface IUseSiteSource {
  site: Ref<ISite>
  siteError: Ref<string | undefined>
  apiSiteId: Ref<string | undefined>
  siteStore: Ref<ISiteStore>
  initializeSite: (siteId: string | undefined) => Promise<void>
}

const siteStore = ref() as Ref<ISiteStore>
let restoredSite: ISiteRestore
const siteError = ref<string>()
const apiSiteId = ref<string>()

export const useSiteSource = (): IUseSiteSource => {
  const initializeSite = async (siteId: string | undefined) => {
    siteStore.value = useSiteStore({ siteId })
    await siteStore.value.initialize()
    restoredSite = await siteStore.value.restore()
    site.value = restoredSite.site
    apiSiteId.value = siteId
    siteError.value = restoredSite.error
  }

  return { initializeSite, apiSiteId, siteStore, site, siteError }
}
