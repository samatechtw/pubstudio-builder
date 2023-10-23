import { IStyleEntry } from '@pubstudio/shared/type-site'

export interface ISetComponentCustomStyleData {
  componentId: string
  breakpointId: string
  oldStyle?: IStyleEntry
  newStyle?: IStyleEntry
}
