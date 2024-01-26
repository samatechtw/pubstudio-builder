import {
  IApiPlatformSite,
  useLocalSiteApi,
  usePlatformSiteApi,
} from '@pubstudio/frontend/data-access-api'
import {
  ApiInjectionKey,
  StoreInjectionKey,
} from '@pubstudio/frontend/data-access-injection'
import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import {
  parseApiError,
  parseApiErrorKey,
  PSApi,
  toApiError,
} from '@pubstudio/frontend/util-api'
import { IUpdateLocalSiteApiRequest } from '@pubstudio/shared/type-api-local-site'
import {
  ICreatePlatformSiteRequest,
  IListPlatformSitesRequest,
  ISiteViewModel,
  IUpdatePlatformSiteRequest,
} from '@pubstudio/shared/type-api-platform-site'
import { useI18n } from 'petite-vue-i18n'
import { inject, Ref, ref } from 'vue'

const subdomainFormatRegex = new RegExp(/^[a-z]([a-z\d-]+)?$/g)

const reservedSubdomains = new Set<string>([
  'www',
  'app',
  'admin',
  'stg',
  'demo',
  'site-assets',
  'site-backups',
  'api',
])

const reservedSubdomainRegex = new RegExp(/^s\d+$/g)

export interface ISitesFeature {
  api: IApiPlatformSite
  loading: Ref<boolean>
  error: Ref<string | undefined>
  errorKey: Ref<string | undefined>
  sites: Ref<ISiteViewModel[] | undefined>
  usageAllowance: Ref<number | undefined>
  createSite: (data: ICreatePlatformSiteRequest) => Promise<void>
  updateSite: (id: string, data: IUpdatePlatformSiteRequest) => Promise<void>
  updateLocalSite: (id: string, data: IUpdateLocalSiteApiRequest) => Promise<void>
  listSites: (params: IListPlatformSitesRequest) => Promise<void>
  deleteSite: (id: string) => Promise<void>
  siteNameToSubdomain: (siteName: string) => string
  validateSubdomain: (subdomain: string) => string | undefined
  validateSiteName: (name: string) => string | undefined
  validateNamespace: (namespace: string) => string | undefined
}

export const useSites = (): ISitesFeature => {
  const i18n = useI18n()
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = usePlatformSiteApi(rootApi)
  const localSiteApi = useLocalSiteApi(rootApi)
  const loading = ref(false)
  const error = ref()
  const errorKey = ref<string | undefined>()
  const sites = ref<ISiteViewModel[]>()
  const store = inject(StoreInjectionKey) as IFrontendStore
  const usageAllowance = ref()

  const createSite = async (data: ICreatePlatformSiteRequest): Promise<void> => {
    try {
      loading.value = true
      await api.createSite(data)
    } catch (e) {
      error.value = parseApiError(i18n, toApiError(e))
    } finally {
      loading.value = false
    }
  }

  const updateSite = async (
    id: string,
    data: IUpdatePlatformSiteRequest,
  ): Promise<void> => {
    try {
      loading.value = true
      await api.updateSite(id, data)
    } catch (e) {
      error.value = parseApiError(i18n, toApiError(e))
    } finally {
      loading.value = false
    }
  }

  const updateLocalSite = async (id: string, data: IUpdateLocalSiteApiRequest) => {
    try {
      await localSiteApi.updateLocalSite(id, data)
      store.user.updateIdentity(data)
    } catch (e) {
      error.value = parseApiError(i18n, toApiError(e))
    }
  }

  const listSites = async (params: IListPlatformSitesRequest): Promise<void> => {
    try {
      loading.value = true
      const response = await api.listSites(params)
      usageAllowance.value = response.asset_allowance
      sites.value = response.results
    } catch (e) {
      error.value = parseApiError(i18n, toApiError(e))
    } finally {
      loading.value = false
    }
  }

  const deleteSite = async (id: string): Promise<void> => {
    try {
      loading.value = true
      await api.deleteSite(id)
    } catch (e) {
      const apiError = toApiError(e)
      error.value = parseApiError(i18n, apiError)
      errorKey.value = parseApiErrorKey(apiError)
    } finally {
      loading.value = false
    }
  }

  const siteNameToSubdomain = (siteName: string): string => {
    return siteName.toLowerCase().replace(/\s_/g, '-')
  }

  const validateSubdomain = (subdomain: string): string | undefined => {
    if (!subdomain) {
      return i18n.t('errors.site_subdomain_empty')
    } else if (!subdomain.match(subdomainFormatRegex)) {
      return i18n.t('errors.site_subdomain_format')
    } else if (
      reservedSubdomains.has(subdomain) ||
      subdomain.match(reservedSubdomainRegex)
    ) {
      return i18n.t('errors.site_subdomain_reserved')
    } else {
      return undefined
    }
  }

  const validateSiteName = (name: string): string | undefined => {
    if (!/^[a-zA-Z0-9 ]{2,50}$/.test(name)) {
      return i18n.t('errors.site_name')
    }
    return undefined
  }

  const validateNamespace = (name: string): string | undefined => {
    if (!/^[a-zA-Z0-9_]{2,50}$/.test(name)) {
      return i18n.t('errors.namespace')
    }
    return undefined
  }

  return {
    api,
    loading,
    error,
    errorKey,
    sites,
    usageAllowance,
    createSite,
    updateSite,
    updateLocalSite,
    listSites,
    deleteSite,
    siteNameToSubdomain,
    validateSubdomain,
    validateSiteName,
    validateNamespace,
  }
}
