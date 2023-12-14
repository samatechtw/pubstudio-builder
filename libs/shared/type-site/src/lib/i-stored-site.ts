export interface IStoredSite {
  name: string | null
  version: string | null
  defaults: string | null
  context: string | null
  pages: string | null
  editor?: string | null
  history?: string | null
  updated_at?: string | null
}

export type IStoredSiteDirty = {
  [key in keyof Omit<IStoredSite, 'updated_at'>]: boolean
}
