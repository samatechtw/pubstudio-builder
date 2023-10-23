export interface IListGoogleFontsResponse {
  kind: string
  items: IGoogleFontItem[]
}

export interface IGoogleFontItem {
  category: string
  family: string
  files: Record<string, string>
  kind: string
  lastModified: string
  menu: string
  subsets: string[]
  variants: string[]
  version: string
}
