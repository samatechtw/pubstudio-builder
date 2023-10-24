import { IAddThemeVariableData } from '@pubstudio/shared/type-command-data'

export const mockAddThemeVariableData = (
  key: string,
  value: string,
): IAddThemeVariableData => {
  const data: IAddThemeVariableData = {
    key,
    value,
  }
  return data
}
