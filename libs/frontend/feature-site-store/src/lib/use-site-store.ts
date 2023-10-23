import { ISiteStore } from '@pubstudio/shared/type-site-store'
import { useApiStore } from './use-api-store'
import { useLocalStore } from './use-local-store'

export interface IUseSiteStoreProps {
  siteId: string | undefined
}

export const useSiteStore = (props: IUseSiteStoreProps): ISiteStore => {
  const { siteId } = props
  // The reason we initialize localstore like this is not obvious, the purpose
  // is to allow other code to later call `useLocalStore` without calculating the key,
  // since it's cached in the module.
  const isScratch = !siteId || siteId === 'scratch'
  const localStoreKey = isScratch ? 'scratchSite' : 'site'
  const localStore = useLocalStore(localStoreKey)

  const siteStore = isScratch ? localStore : useApiStore({ siteId })
  return {
    ...siteStore,
  }
}
