import { SiteType } from './enum-site-type'

export interface IUpdatePlatformSiteRequest {
  name?: string
  published?: boolean
  subdomain?: string
  custom_domains?: string[]
  type?: SiteType
}
