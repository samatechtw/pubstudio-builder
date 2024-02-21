import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { useSiteVersion } from '@pubstudio/frontend/feature-site-version'
import { useApiStore } from './use-api-store'
import { useLocalStore } from './use-local-store'

export interface IInitializeSiteStoreOptions {
  siteApiUrl?: string
  siteId: string | undefined
}

export const initializeSiteStore = async (options: IInitializeSiteStoreOptions) => {
  const { initializeSite } = useSiteSource()
  const { siteId, siteApiUrl } = options

  // The reason we initialize localstore like this is not obvious, the purpose
  // is to allow other code to later call `useLocalStore` without calculating the key,
  // since it's cached in the module.
  const isScratch = !siteId || siteId === 'scratch'
  const localStoreKey = isScratch ? 'scratchSite' : 'site'
  const localStore = useLocalStore(localStoreKey)
  const store = isScratch ? localStore : useApiStore({ siteId, siteApiUrl })
  const serverAddress = await initializeSite({
    store,
    siteId,
  })
  await useSiteVersion({ serverAddress }).listVersions(siteId)
}
