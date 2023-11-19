import { IStyleEntry } from '@pubstudio/shared/type-site'

export interface ISetComponentOverrideStyleData {
  selector: string
  componentId: string
  breakpointId: string
  oldStyle?: IStyleEntry
  newStyle?: IStyleEntry
}
