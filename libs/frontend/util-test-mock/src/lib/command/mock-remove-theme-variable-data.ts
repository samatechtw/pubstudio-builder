import { IRemoveThemeVariableData } from '@pubstudio/shared/type-command-data'

export const mockRemoveThemeVariableData = (
  key: string,
  value: string,
): IRemoveThemeVariableData => {
  const data: IRemoveThemeVariableData = {
    key,
    value,
  }
  return data
}
