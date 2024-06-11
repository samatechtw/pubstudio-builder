import { IStyleEntry } from '@pubstudio/shared/type-site'

export interface ISetMixinEntryData {
  mixinId: string
  breakpointId: string
  oldStyle?: IStyleEntry
  newStyle?: IStyleEntry
}
