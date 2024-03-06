import { SiteType } from './enum-site-type'

export interface IUpdatePlatformSiteRequest {
  name?: string
  subdomain?: string
  custom_domains?: string[]
  type?: SiteType
}
