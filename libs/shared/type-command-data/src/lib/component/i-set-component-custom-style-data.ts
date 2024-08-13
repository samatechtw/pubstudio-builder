import { IStyleEntry } from '@pubstudio/shared/type-site'

export interface ISetComponentCustomStyleData {
  componentId: string
  breakpointId: string
  // Set selected component in editor
  select?: boolean
  oldStyle?: IStyleEntry
  newStyle?: IStyleEntry
}
