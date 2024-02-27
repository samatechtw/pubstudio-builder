export interface ISiteMetadata {
  id: string
  disabled: boolean
  location: string
  site_type: string
}

export type IListSitesApiResponse = ISiteMetadata[]
