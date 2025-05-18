import { useSiteAssetApi } from '@pubstudio/frontend/data-access-api'
import { ApiInjectionKey } from '@pubstudio/frontend/data-access-injection'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { PSApi } from '@pubstudio/frontend/util-api'
import { ISiteViewModel } from '@pubstudio/shared/type-api-platform-site'
import {
  AssetContentType,
  IListPlatformSiteAssetsRequest,
  ISiteAssetViewModel,
  SiteAssetState,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { ILocalSiteRelationViewModel } from '@pubstudio/shared/type-api-platform-user'
import { debounce } from '@pubstudio/shared/util-debounce'
import { computed, inject, Ref, ref, watch } from 'vue'

export type ILocalOrApiSite = ILocalSiteRelationViewModel | ISiteViewModel

export interface IUseAssetsFilterOptions {
  defaultContentType?: AssetContentType
  sites: Ref<ISiteViewModel[] | undefined>
  initialSiteId: Ref<string | undefined>
  initialUrl: Ref<string | undefined>
}

export const useAssetsFilter = (options: IUseAssetsFilterOptions) => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const api = useSiteAssetApi(rootApi)
  const { defaultContentType, initialUrl, initialSiteId, sites } = options

  const defaultFilter = (): IListPlatformSiteAssetsRequest => {
    let siteId = initialSiteId.value

    if (siteId === 'scratch') {
      siteId = undefined
    } else if (siteId === 'identity') {
      siteId = store.user.identity.value.id
    }

    return {
      site_id: siteId,
      content_type: defaultContentType,
      search: undefined,
    }
  }

  const loading = ref(false)
  const siteAssets = ref<ISiteAssetViewModel[]>()
  const filter = ref<IListPlatformSiteAssetsRequest>(defaultFilter())
  const showCreateModal = ref(false)
  const externalUrl = ref(initialUrl.value ?? '')

  const resolvedSites = computed<ILocalOrApiSite[]>(() => [
    store.user.identity.value,
    ...(sites.value ?? []),
  ])

  const updateSite = async (site: ILocalOrApiSite | undefined) => {
    filter.value.site_id = site?.id
    await listAssets()
  }

  const updateSearch = debounce(async (search: string) => {
    filter.value.search = search
    await listAssets()
  }, 500)

  const updateContentType = async (contentType: AssetContentType | undefined) => {
    filter.value.content_type = contentType
    await listAssets()
  }

  const listAssets = async () => {
    loading.value = true
    try {
      const response = await api.listSiteAssets({
        ...filter.value,
        user_id: store.user.id.value,
        state: SiteAssetState.Uploaded,
      })
      siteAssets.value = response.results
    } catch (e) {
      console.log('List site assets error: ', e)
      siteAssets.value = undefined
    }
    loading.value = false
  }

  // SelectSourceModal and SelectAssetModal are not reset if another video/image component
  // is clicked, so this is needed to keep state in sync
  watch(initialUrl, (newUrl) => {
    externalUrl.value = newUrl ?? ''
  })

  return {
    loading,
    resolvedSites,
    siteAssets,
    filter,
    showCreateModal,
    externalUrl,
    defaultFilter,
    updateSite,
    updateSearch,
    updateContentType,
    listAssets,
  }
}
