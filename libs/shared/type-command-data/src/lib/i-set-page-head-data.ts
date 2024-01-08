import { IHeadObject, IPageHeadTag } from '@pubstudio/shared/type-site'

export interface ISetPageHeadData {
  route: string
  tag: IPageHeadTag
  index: number
  oldValue?: IHeadObject | string
  newValue?: IHeadObject | string
}
