import { IAddThemeFontData } from '@pubstudio/shared/type-command-data'
import { ThemeFontSource, WebSafeFont } from '@pubstudio/shared/type-site'

export const mockAddThemeFontData = (
  source: ThemeFontSource,
  name: string,
  fallback?: WebSafeFont,
): IAddThemeFontData => {
  return {
    source,
    name,
    fallback,
  }
}
