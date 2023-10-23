import { ISortOption } from '@pubstudio/shared/type-sort'
import { SiteType } from './enum-site-type'

export interface IListPlatformSitesRequest extends ISortOption {
  owner_id?: string
  site_server_id?: string
  type?: SiteType
  published?: boolean
  readonly from?: number
  readonly to?: number
}
