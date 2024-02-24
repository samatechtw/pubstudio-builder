import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddThemeFontData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface AddThemeFont extends ICommand<IAddThemeFontData> {
  type: CommandType.AddThemeFont
}

export const applyAddThemeFont = (site: ISite, data: IAddThemeFontData) => {
  const { source, name, fallback } = data
  site.context.theme.fonts[name] = {
    source,
    name,
    fallback,
  }
}

export const undoAddThemeFont = (site: ISite, data: IAddThemeFontData) => {
  const theme = site.context.theme
  if (data.name in theme.fonts) {
    delete theme.fonts[data.name]
  }
}
