import { IAdminTablePagination } from '@pubstudio/frontend/util-fields'
import { LocalStoragePlugin, useModule } from '@samatech/vue-store'

interface AssetState extends IAdminTablePagination {
  sort: string
  search: string
  siteId: string | null
  contentType: string | null
}

const assetInit = (): AssetState => ({
  total: 0,
  page: 1,
  pageSize: 25,
  sort: 'created_at.desc',
  search: '',
  siteId: null,
  contentType: null,
})

const assetMutations = (asset: AssetState) => ({
  updatePagination: (data: IAdminTablePagination) => {
    asset.total = data.total
    asset.page = data.page
    asset.pageSize = data.pageSize
  },
  updateSiteId: (siteId: string | undefined) => {
    asset.siteId = siteId || null
  },
  updateContentType: (contentType: string | undefined) => {
    asset.contentType = contentType || null
  },
  updateSort: (sort: string) => {
    asset.sort = sort
  },
  updateSearch: (search: string) => {
    asset.search = search
  },
  updateFilters: (
    filters: Pick<AssetState, 'sort' | 'search' | 'siteId' | 'contentType'>,
  ) => {
    asset.sort = filters.sort
    asset.search = filters.search
    asset.siteId = filters.siteId
    asset.contentType = filters.contentType
  },
})

export const assetModule = useModule<
  AssetState,
  Record<string, never>,
  ReturnType<typeof assetMutations>
>({
  name: 'asset',
  version: 1,
  stateInit: assetInit,
  mutations: assetMutations,
  plugins: [LocalStoragePlugin],
})

export type AssetModule = typeof assetModule
