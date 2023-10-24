import { IRemovePageData } from '@pubstudio/shared/type-command-data'
import { ISerializedPage } from '@pubstudio/shared/type-site'

export const mockRemovePageData = (
  pageRoute: string,
  serializedPage: ISerializedPage,
  selectedComponentId: string | undefined,
): IRemovePageData => {
  return {
    pageRoute,
    serializedPage,
    selectedComponentId,
  }
}
