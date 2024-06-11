import { serializePage } from '@pubstudio/frontend/util-site-store'
import { IRemovePageData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const mockRemovePageData = (site: ISite, pageRoute: string): IRemovePageData => {
  return {
    pageRoute,
    serializedPage: serializePage(site.pages[pageRoute]),
    selectedComponentId: site.editor?.selectedComponent?.id,
    orderIndex: site.pageOrder.indexOf(pageRoute),
  }
}
