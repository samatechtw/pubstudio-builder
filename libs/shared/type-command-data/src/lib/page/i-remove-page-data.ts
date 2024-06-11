import { ISerializedPage } from '@pubstudio/shared/type-site'

export interface IRemovePageData {
  pageRoute: string
  orderIndex: number
  serializedPage: ISerializedPage
  selectedComponentId?: string
}
