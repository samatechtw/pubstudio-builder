import { ISortOption } from '@pubstudio/shared/type-sort'
import { AssetContentType } from './asset-content-type'
import { SiteAssetState } from './site-asset-state'

export interface IListPlatformSiteAssetsRequest extends ISortOption {
  user_id?: string
  site_id?: string
  content_type?: AssetContentType
  state?: SiteAssetState
  search?: string
  from?: number
  to?: number
}
