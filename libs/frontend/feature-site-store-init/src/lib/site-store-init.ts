import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { rootSiteApi } from '@pubstudio/shared/util-web-site-api'
import { Ref } from 'vue'
import { useApiStore } from './use-api-store'
import { useLocalStore } from './use-local-store'

export interface IInitializeSiteStoreOptions {
  siteApiUrl?: string
  authBypassToken?: Ref<string>
  siteId: string | undefined
  // For setting up access to the Site API
  userToken?: Ref<string | null>
}

export const initializeSiteStore = async (
  options: IInitializeSiteStoreOptions,
): Promise<string | undefined> => {
  const { initializeSite } = useSiteSource()
  const { siteId, siteApiUrl, authBypassToken, userToken } = options

  // The reason we initialize localstore like this is not obvious, the purpose
  // is to allow other code to later call `useLocalStore` without calculating the key,
  // since it's cached in the module.
  const isScratch = !siteId || siteId === 'scratch'
  const localStoreKey = isScratch ? 'scratchSite' : 'site'
  const localStore = useLocalStore(localStoreKey)
  const store = isScratch
    ? localStore
    : useApiStore({ siteId, siteApiUrl, authBypassToken })
  const serverAddress = await initializeSite({
    store,
    siteId,
    userToken,
  })
  rootSiteApi.baseUrl = serverAddress ? `${serverAddress}/` : ''
  rootSiteApi.siteId.value = siteId
  return serverAddress
}
