export interface ISiteViewModel {
  id: string
  name: string
  version: string
  context: string
  defaults: string
  editor: string
  history: string
  pages: string
  published: boolean
  disabled?: boolean
  updated_at: Date
  content_updated_at: number
}
