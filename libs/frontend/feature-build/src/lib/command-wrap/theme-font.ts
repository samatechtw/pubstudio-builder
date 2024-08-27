import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType } from '@pubstudio/shared/type-command'
import {
  IAddThemeFontData,
  IEditThemeFontData,
  IRemoveThemeFontData,
} from '@pubstudio/shared/type-command-data'
import { ISite, IThemeFont } from '@pubstudio/shared/type-site'

export const addThemeFont = (site: ISite, font: IAddThemeFontData) => {
  const data: IAddThemeFontData = { ...font }
  pushCommand(site, CommandType.AddThemeFont, data)
}

export const editThemeFont = (site: ISite, oldFont: IThemeFont, newFont: IThemeFont) => {
  const data: IEditThemeFontData = {
    oldFont,
    newFont,
  }
  pushCommand(site, CommandType.EditThemeFont, data)
}

export const deleteThemeFont = (site: ISite, font: IThemeFont) => {
  const data: IRemoveThemeFontData = {
    source: font.source,
    name: font.name,
  }
  pushCommand(site, CommandType.RemoveThemeFont, data)
}
