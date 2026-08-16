import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { makeSetGlobalStyleData } from '@pubstudio/frontend/util-command-data'
import { CommandType } from '@pubstudio/shared/type-command'
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
  const data = makeSetGlobalStyleData(site, name, newName, style)
  pushCommand(site, CommandType.SetGlobalStyle, data)
}

export const removeGlobalStyle = (site: ISite, name: string) => {
  const data = makeSetGlobalStyleData(site, name, undefined, undefined)
  pushCommand(site, CommandType.SetGlobalStyle, data)
}
