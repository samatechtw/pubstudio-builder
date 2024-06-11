import { IPageMetadata } from '@pubstudio/shared/type-site'
import { IAddComponentData } from '../component/i-add-component-data'

export interface IAddPageData {
  metadata: IPageMetadata
  activePageRoute: string
  selectedComponentId?: string
  root?: IAddComponentData
}
