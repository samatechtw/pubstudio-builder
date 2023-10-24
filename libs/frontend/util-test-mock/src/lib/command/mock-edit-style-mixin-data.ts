import { IEditStyleMixinData } from '@pubstudio/shared/type-command-data'
import { IStyle } from '@pubstudio/shared/type-site'

export const mockEditStyleMixinData = (
  oldStyle: IStyle,
  newStyle: IStyle,
): IEditStyleMixinData => {
  const data: IEditStyleMixinData = {
    oldStyle,
    newStyle,
  }
  return data
}
