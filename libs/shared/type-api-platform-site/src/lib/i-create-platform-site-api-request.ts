import { SiteType } from './enum-site-type'

export interface ICreatePlatformSiteRequest {
  name: string
  type: SiteType
  subdomain: string
  custom_domains: string[]
  checkout_id?: string
}
