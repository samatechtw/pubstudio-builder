import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'

export interface ISiteMetadata {
  id: string
  owner_email: string
  owner_id: string
  disabled: boolean
  location: string
  site_type: string
  custom_domains: ICustomDomainRelationViewModel[]
}

export type IListSitesApiResponse = ISiteMetadata[]
