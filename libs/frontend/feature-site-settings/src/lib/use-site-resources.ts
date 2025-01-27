import { useSiteApi } from '@pubstudio/frontend/data-access-site-api'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { parseApiErrorKey, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { ISiteViewModel } from '@pubstudio/shared/type-api-platform-site'
import { IGetSiteUsageApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { plainResponseInterceptors } from '@pubstudio/shared/util-web-site-api'
import { Ref, ref } from 'vue'

export type IGetSiteUsageParams = Pick<ISiteViewModel, 'id' | 'site_server'>

export interface ISiteResourcesFeature {
  usageLoading: Ref<boolean>
  errorKey: Ref<string | undefined>
  usage: Ref<IGetSiteUsageApiResponse | undefined>
  getSiteUsage: (data: IGetSiteUsageParams) => Promise<void>
}

export const useSiteResources = (): ISiteResourcesFeature => {
  const usageLoading = ref(false)
  const errorKey = ref()
  const usage = ref<IGetSiteUsageApiResponse>()

  const getSiteUsage = async (site: IGetSiteUsageParams): Promise<void> => {
    const apiSite = new PSApi({
      baseUrl: `${site.site_server.address}/api/`,
      userToken: store.auth.token,
      responseInterceptors: [...plainResponseInterceptors],
    })
    try {
      usageLoading.value = true
      const siteApi = useSiteApi(apiSite)
      usage.value = await siteApi.getSiteUsage(site.id)
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    } finally {
      usageLoading.value = false
    }
  }

  return {
    usageLoading,
    errorKey,
    usage,
    getSiteUsage,
  }
}
