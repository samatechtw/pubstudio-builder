import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { ref } from 'vue'
import { SiteApi } from './api'

export const rootSiteApi = new SiteApi({
  baseUrl: '',
  userToken: ref(null),
})

export interface IApiSite {
  getLatestSite(siteId: number): Promise<IGetSiteApiResponse>
}

export const useSiteApi = (api: SiteApi): IApiSite => {
  const getLatestSite = async (siteId: number): Promise<IGetSiteApiResponse> => {
    const { data } = await api.request({
      url: `sites/${siteId}/latest`,
      method: 'GET',
    })
    return data as IGetSiteApiResponse
  }

  return {
    getLatestSite,
  }
}
