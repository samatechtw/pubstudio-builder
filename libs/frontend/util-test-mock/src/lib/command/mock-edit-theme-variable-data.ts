import { IEditThemeVariableData } from '@pubstudio/shared/type-command-data'
import { IThemeVariable } from '@pubstudio/shared/type-site'

export const mockEditThemeVariableData = (
  oldThemeVariable: IThemeVariable,
  newThemeVariable: IThemeVariable,
): IEditThemeVariableData => {
  const data: IEditThemeVariableData = {
    oldThemeVariable,
    newThemeVariable,
  }
  return data
}
