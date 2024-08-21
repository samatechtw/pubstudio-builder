import { SiteType } from './enum-site-type'

export interface ICreatePlatformSiteResponse {
  id: string
  name: string
  type: SiteType
  subdomain_record_id: string
  subdomain: string
  owner_id: string
}
