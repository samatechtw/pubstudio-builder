export interface ISiteMetadata {
  id: string
  disabled: boolean
  location: string
  site_type: string
  custom_domains: string[]
}

export type IListSitesApiResponse = ISiteMetadata[]
