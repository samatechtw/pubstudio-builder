export interface ICreateSiteApiRequest {
  id: string
  owner_id: string
  owner_email: string
  name: string
  version: string
  context: string
  defaults: string
  editor: string
  history: string
  pages: string
  published: boolean
  domains: string[]
  site_type: string
}
