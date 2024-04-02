import { useLocalSiteApi, usePlatformSiteApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { PSApi } from '@pubstudio/frontend/util-api'
import { SiteType, SiteVariant } from '@pubstudio/shared/type-api-platform-site'
import { IGetSiteVersionApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { inject } from 'vue'
import { IMergedSiteData } from './i-merged-site-data'

export interface IUseGetSite {
  getSiteInfo: (id: string) => Promise<IMergedSiteData | undefined>
  getSiteData: (id: string) => Promise<IGetSiteVersionApiResponse | undefined>
}

export const useGetSite = (): IUseGetSite => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const { apiSite } = useSiteSource()

  // Get local/identity or site-api site info
  const getSiteInfo = async (id: string): Promise<IMergedSiteData | undefined> => {
    let mergedSite: IMergedSiteData | undefined = undefined
    try {
      if (id === 'identity') {
        const { getLocalSite } = useLocalSiteApi(rootApi)
        const site = await getLocalSite(store.user.identity.value.id)
        if (!site) {
          return undefined
        }
        mergedSite = {
          ...site,
          id: 'identity',
          site_type: SiteType.Free,
          custom_domains: [],
          variant: SiteVariant.Local,
        }
      } else if (id) {
        const { getSite } = usePlatformSiteApi(rootApi)
        const site = await getSite(id)
        mergedSite = {
          ...site,
          variant: SiteVariant.SiteApi,
        }
      }
    } catch (e) {
      console.log('Failed to get site:', e)
    }
    return mergedSite
  }

  // TODO -- may be possible to reuse/merge with libs/frontend/feature-site-store/src/lib/use-api-store.ts
  const getSiteData = async (
    id: string,
  ): Promise<IGetSiteVersionApiResponse | undefined> => {
    let siteData: IGetSiteVersionApiResponse | undefined = undefined
    try {
      if (id === 'identity') {
        const { getLocalSite } = useLocalSiteApi(rootApi)
        siteData = await getLocalSite(store.user.identity.value.id)
      } else if (id) {
        if (apiSite) {
          const siteApi = useSiteApi(apiSite)
          siteData = await siteApi?.getSiteVersion(id, 'latest')
        }
      }
    } catch (e) {
      console.log('Failed to get site:', e)
    }
    return siteData
  }

  return { getSiteInfo, getSiteData }
}
