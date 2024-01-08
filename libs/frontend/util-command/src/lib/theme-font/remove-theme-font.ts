import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IRemoveThemeFontData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface RemoveThemeFont extends ICommand<IRemoveThemeFontData> {
  type: CommandType.RemoveThemeFont
}

export const applyRemoveThemeFont = (site: ISite, data: IRemoveThemeFontData) => {
  delete site.context.theme.fonts[data.name]
}

export const undoRemoveThemeFont = (site: ISite, data: IRemoveThemeFontData) => {
  const { source, name, fallback } = data
  site.context.theme.fonts[name] = {
    source,
    name,
    fallback,
  }
}
