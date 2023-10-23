import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IAddThemeVariableData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface AddThemeVariable extends ICommand<IAddThemeVariableData> {
  type: CommandType.AddThemeVariable
}

export const applyAddThemeVariable = (site: ISite, data: IAddThemeVariableData) => {
  const { key, value } = data
  site.context.theme.variables[key] = value
}

export const undoAddThemeVariable = (site: ISite, data: IAddThemeVariableData) => {
  const theme = site.context.theme
  if (data.key in theme.variables) {
    delete theme.variables[data.key]
  }
}
