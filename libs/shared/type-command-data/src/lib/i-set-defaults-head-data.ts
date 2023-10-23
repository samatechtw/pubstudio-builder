import { IHeadObject, IHeadTag } from '@pubstudio/shared/type-site'

export interface ISetDefaultsHeadData {
  tag: IHeadTag
  index: number
  oldValue?: IHeadObject
  newValue?: IHeadObject
}
