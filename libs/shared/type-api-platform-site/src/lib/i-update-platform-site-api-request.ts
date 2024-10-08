import { SiteType } from './enum-site-type'

export interface IUpdatePlatformSiteRequest {
  name?: string
  subdomain?: string
  type?: SiteType
  owner_id?: string
  owner_email?: string
}
