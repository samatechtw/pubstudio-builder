import { IEditThemeFontData } from '@pubstudio/shared/type-command-data'
import { IThemeFont } from '@pubstudio/shared/type-site'

export const mockEditThemeFontData = (
  oldFont: IThemeFont,
  newFont: IThemeFont,
): IEditThemeFontData => {
  return {
    oldFont,
    newFont,
  }
}
