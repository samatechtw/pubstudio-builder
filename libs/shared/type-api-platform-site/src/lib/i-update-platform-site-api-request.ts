import { SiteType } from './enum-site-type'

export interface IUpdatePlatformSiteRequest {
  name?: string
  subdomain?: string
  type?: SiteType
  version?: string
  owner_id?: string
  owner_email?: string
}
