import { ILocalSiteViewModel } from './i-local-site.view-model'

export interface IUpdateLocalSiteApiResponse extends ILocalSiteViewModel {
  subdomain: string
}
