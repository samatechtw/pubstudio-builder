import { ISiteAssetViewModel } from './i-site-asset.view-model'

export interface IListPlatformSiteAssetsResponse {
  total: number
  total_usage: number
  results: ISiteAssetViewModel[]
}
