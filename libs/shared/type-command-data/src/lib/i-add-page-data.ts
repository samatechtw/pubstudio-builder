import { IPageMetadata } from '@pubstudio/shared/type-site'

export interface IAddPageData {
  metadata: IPageMetadata
  activePageRoute: string
  selectedComponentId?: string
}
