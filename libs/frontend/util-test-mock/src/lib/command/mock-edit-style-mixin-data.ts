import { IEditStyleMixinData } from '@pubstudio/shared/type-command-data'

export const mockEditStyleMixinData = (
  id: string,
  oldName: string,
  newName: string,
): IEditStyleMixinData => {
  const data: IEditStyleMixinData = {
    id,
    oldName,
    newName,
  }
  return data
}
