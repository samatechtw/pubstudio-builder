export interface ITemplateViewModel {
  id: string
  preview_url: string
  collection_id: string
  description: string
  sort_priority?: number
  categories: string[]
  public: boolean
  name: string
  version: string
  context: string
  defaults: string
  pages: string
  pageOrder: string
  created_at: Date
}
