import { usePlatformSiteApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { parseApiError, PSApi, toApiError } from '@pubstudio/frontend/util-api'
import { IApiPlatformSite } from '@pubstudio/shared/type-api-interfaces'
import { useI18n } from 'petite-vue-i18n'
import { inject, Ref, ref } from 'vue'

export interface ISiteDomainsFeature {
  api: IApiPlatformSite
  updating: Ref<boolean>
  verifying: Ref<string>
  error: Ref<string | undefined>
  addSiteDomain: (siteId: string, domain: string) => Promise<void>
  deleteSiteDomain: (siteId: string, domain: string) => Promise<void>
  verifySiteDomain: (siteId: string, domain: string) => Promise<void>
}

const updating = ref(false)
const verifying = ref()

export const useSiteDomains = (): ISiteDomainsFeature => {
  const i18n = useI18n()
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = usePlatformSiteApi(rootApi)
  const error = ref()

  const addSiteDomain = async (siteId: string, domain: string): Promise<void> => {
    try {
      error.value = undefined
      updating.value = true
      await api.addSiteDomain(siteId, domain)
    } catch (e) {
      const apiError = toApiError(e)
      error.value = parseApiError(i18n, apiError)
    } finally {
      updating.value = false
    }
  }

  const deleteSiteDomain = async (siteId: string, domain: string): Promise<void> => {
    try {
      error.value = undefined
      updating.value = true
      await api.deleteSiteDomain(siteId, domain)
    } catch (e) {
      const apiError = toApiError(e)
      error.value = parseApiError(i18n, apiError)
    } finally {
      updating.value = false
    }
  }

  const verifySiteDomain = async (siteId: string, domain: string): Promise<void> => {
    try {
      error.value = undefined
      verifying.value = domain
      await api.verifySiteDomain(siteId, domain)
    } catch (e) {
      const apiError = toApiError(e)
      error.value = parseApiError(i18n, apiError)
    } finally {
      verifying.value = undefined
    }
  }

  return {
    api,
    updating,
    verifying,
    error,
    addSiteDomain,
    deleteSiteDomain,
    verifySiteDomain,
  }
}
