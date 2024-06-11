import { IPageMetadata } from '@pubstudio/shared/type-site'
import { IOrderData } from '../i-order-data'

export interface IEditPageData {
  oldMetadata?: IPageMetadata
  newMetadata?: IPageMetadata
  order?: IOrderData
}
