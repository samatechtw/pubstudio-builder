import { ThemeFontSource, WebSafeFont } from '@pubstudio/shared/type-site'

export interface IAddThemeFontData {
  source: ThemeFontSource
  name: string
  url?: string
  fallback?: WebSafeFont
}
