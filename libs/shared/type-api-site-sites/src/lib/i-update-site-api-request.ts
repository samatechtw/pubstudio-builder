export interface IUpdateSiteApiRequest {
  name?: string
  version?: string
  context?: string
  defaults?: string
  editor?: string
  history?: string
  pages?: string
  pageOrder?: string
  update_key?: string
  enable_preview?: boolean
}
