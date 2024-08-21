import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'

export interface IUpdateSiteMetadataApiRequest {
  domains?: ICustomDomainRelationViewModel[]
  disabled?: boolean
  site_type?: string
  owner_email?: string
  owner_id?: string
}
