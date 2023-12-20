import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IRemoveThemeVariableData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface RemoveThemeVariable extends ICommand<IRemoveThemeVariableData> {
  type: CommandType.RemoveThemeVariable
}

export const applyRemoveThemeVariable = (site: ISite, data: IRemoveThemeVariableData) => {
  delete site.context.theme.variables[data.key]
}

export const undoRemoveThemeVariable = (site: ISite, data: IRemoveThemeVariableData) => {
  const { key, value } = data
  site.context.theme.variables[key] = value
}
