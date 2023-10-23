import { ISerializedPage } from '@pubstudio/shared/type-site'

export interface IRemovePageData {
  pageRoute: string
  serializedPage: ISerializedPage
  selectedComponentId?: string
}
