import { IHeadObject, IHeadTag } from '@pubstudio/shared/type-site'

export interface ISetPageHeadData {
  route: string
  tag: IHeadTag
  index: number
  oldValue?: IHeadObject
  newValue?: IHeadObject
}
