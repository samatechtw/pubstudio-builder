import { ISiteViewModel } from '@pubstudio/shared/type-api-site-sites'

export interface ILocalSiteViewModel extends ISiteViewModel {
  user_id: string
  subdomain: string
}
