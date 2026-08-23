import { arenaPage } from '@pubstudio/frontend/data-access-command'
import { IPage, ISite } from '@pubstudio/shared/type-site'

export const getActivePage = (site: ISite): IPage | undefined => {
  // The component edit screen replaces the canvas with a synthetic arena page
  const arena = arenaPage(site)
  if (arena) {
    return arena
  }
  const route = site.editor?.active
  if (!route) {
    return undefined
  }
  const pages = Object.values(site.pages)
  return pages.find((page) => page.route === route)
}
