import { IGlobalStyle } from '@pubstudio/shared/type-site'

export interface ISetGlobalStyleData {
  name: string
  newName?: string
  oldStyle?: IGlobalStyle
  newStyle?: IGlobalStyle
}
