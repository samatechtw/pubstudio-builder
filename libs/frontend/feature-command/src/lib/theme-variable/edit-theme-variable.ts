import { CommandType, ICommand } from '@pubstudio/shared/type-command'
import { IEditThemeVariableData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export interface EditThemeVariable extends ICommand<IEditThemeVariableData> {
  type: CommandType.EditThemeVariable
}

export const applyEditThemeVariable = (site: ISite, data: IEditThemeVariableData) => {
  const theme = site.context.theme
  const { oldThemeVariable, newThemeVariable } = data
  if (newThemeVariable.key !== oldThemeVariable.key) {
    delete theme.variables[oldThemeVariable.key]
  }
  theme.variables[newThemeVariable.key] = newThemeVariable.value
}

export const undoEditThemeVariable = (site: ISite, data: IEditThemeVariableData) => {
  const theme = site.context.theme
  const { oldThemeVariable, newThemeVariable } = data
  if (newThemeVariable.key !== oldThemeVariable.key) {
    delete theme.variables[newThemeVariable.key]
  }
  theme.variables[oldThemeVariable.key] = oldThemeVariable.value
}
