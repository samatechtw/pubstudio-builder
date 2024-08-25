import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IEditThemeFontData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface EditThemeFont extends ICommand<IEditThemeFontData> {
  type: CommandType.EditThemeFont
}

export const applyEditThemeFont = (site: ISite, data: IEditThemeFontData) => {
  const theme = site.context.theme
  const { oldFont, newFont } = data
  if (oldFont.name !== newFont.name) {
    delete theme.fonts[oldFont.name]
  }
  theme.fonts[newFont.name] = {
    source: newFont.source,
    name: newFont.name,
    url: newFont.url,
    fallback: newFont.fallback,
  }
}

export const undoEditThemeFont = (site: ISite, data: IEditThemeFontData) => {
  const theme = site.context.theme
  const { oldFont, newFont } = data
  if (oldFont.name !== newFont.name) {
    delete theme.fonts[newFont.name]
  }
  theme.fonts[oldFont.name] = {
    source: oldFont.source,
    name: oldFont.name,
    url: oldFont.url,
    fallback: oldFont.fallback,
  }
}
