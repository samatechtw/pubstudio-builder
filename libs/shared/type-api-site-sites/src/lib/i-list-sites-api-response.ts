export interface ISiteMetadata {
  id: number
  location: string
  site_type: string
}

export type IListSitesApiResponse = ISiteMetadata[]
