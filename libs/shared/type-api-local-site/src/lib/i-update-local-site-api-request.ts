import { IUpdateSiteApiRequest } from '@pubstudio/shared/type-api-site-sites'

export interface IUpdateLocalSiteApiRequest
  extends Omit<IUpdateSiteApiRequest, 'domains'> {
  published?: boolean
  subdomain?: string
}
