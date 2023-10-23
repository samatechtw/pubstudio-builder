import { AssetContentType } from './asset-content-type'

export interface IReplacePlatformSiteAssetRequest {
  name: string
  content_size: number
  content_type: AssetContentType
}
