import { IRemoveThemeFontData } from '@pubstudio/shared/type-command-data'
import { IThemeFont } from '@pubstudio/shared/type-site'

export const mockRemoveThemeFontData = (font: IThemeFont): IRemoveThemeFontData => {
  return {
    source: font.source,
    name: font.name,
  }
}
