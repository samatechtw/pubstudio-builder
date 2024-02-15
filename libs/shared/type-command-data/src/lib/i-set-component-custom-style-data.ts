import { IStyleEntryWithInherited } from '@pubstudio/shared/type-site'

export interface ISetComponentCustomStyleData {
  componentId: string
  breakpointId: string
  oldStyle?: IStyleEntryWithInherited
  newStyle?: IStyleEntryWithInherited
}
