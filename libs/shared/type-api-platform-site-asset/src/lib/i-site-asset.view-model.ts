import { SiteAssetState } from './site-asset-state'

export interface ISiteAssetViewModel {
  id: string
  size: number
  name: string
  content_type: string
  url: string
  state: SiteAssetState
  user_id: string
  site_id?: string
  local_site_id?: string
  template_id: string
  upload_expires_at: Date
  created_at: Date
}
