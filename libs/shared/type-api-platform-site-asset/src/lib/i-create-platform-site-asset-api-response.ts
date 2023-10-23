import { ISiteAssetViewModel } from './i-site-asset.view-model'

export interface ICreatePlatformSiteAssetResponse extends ISiteAssetViewModel {
  signed_url: string
}
