import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISetGlobalStyleData } from '@pubstudio/shared/type-command-data'
import { IGlobalStyle, ISite } from '@pubstudio/shared/type-site'

export const addGlobalStyle = (site: ISite, name: string, style: IGlobalStyle) => {
  setGlobalStyle(site, name, undefined, style)
}

export const setGlobalStyle = (
  site: ISite,
  name: string,
  newName: string | undefined,
  style: IGlobalStyle,
) => {
  const data: ISetGlobalStyleData = {
    name,
    newName,
    oldStyle: site.context.globalStyles[name],
    newStyle: style,
  }
  pushCommand(site, CommandType.SetGlobalStyle, data)
}

export const removeGlobalStyle = (site: ISite, name: string) => {
  const data: ISetGlobalStyleData = {
    name,
    oldStyle: site.context.globalStyles[name],
  }
  pushCommand(site, CommandType.SetGlobalStyle, data)
}
