import { IPage, ISite } from '@pubstudio/shared/type-site'

export const getActivePage = (site: ISite): IPage | undefined => {
  const route = site.editor?.active
  if (!route) {
    return undefined
  }
  const pages = Object.values(site.pages)
  return pages.find((page) => page.route === route)
}
