import { AssetContentType } from './asset-content-type'

export interface ICreatePlatformSiteAssetRequest {
  name: string
  content_size: number
  content_type: AssetContentType
  site_id?: string
  local_site_id?: string
  template_id?: string
}
