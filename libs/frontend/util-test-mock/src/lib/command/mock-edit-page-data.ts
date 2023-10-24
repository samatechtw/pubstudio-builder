import { IEditPageData } from '@pubstudio/shared/type-command-data'
import { IPageMetadata, ISite } from '@pubstudio/shared/type-site'

export const mockEditPageData = (
  site: ISite,
  pageName: string,
  newMetadata: IPageMetadata,
): IEditPageData => {
  const page = site.pages[pageName]
  return {
    oldMetadata: {
      name: page.name,
      route: page.route,
      public: page.public,
      head: {
        ...page.head,
      },
    },
    newMetadata,
  }
}
