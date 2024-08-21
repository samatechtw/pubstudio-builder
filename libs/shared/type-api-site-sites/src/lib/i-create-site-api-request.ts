import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'

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
  pageOrder: string
  published: boolean
  domains: ICustomDomainRelationViewModel[]
  site_type: string
}
