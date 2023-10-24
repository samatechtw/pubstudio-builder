import { stringifySite } from '@pubstudio/frontend/util-site-store'
import { ISerializedSite, ISite } from '@pubstudio/shared/type-site'

export const expectSiteWithoutComponentTree = (
  site: ISite,
  original: ISerializedSite,
) => {
  const originalNoTree = JSON.parse(JSON.stringify(original))
  delete originalNoTree.editor.componentTreeExpandedItems

  const siteNoTree = JSON.parse(stringifySite(site))
  delete siteNoTree.editor.componentTreeExpandedItems

  expect(siteNoTree).toEqual(originalNoTree)
}
