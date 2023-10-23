import { ISiteViewModel } from './i-site.view-model'

export interface IListPlatformSitesResponse {
  total: number
  asset_allowance: number
  results: ISiteViewModel[]
}
