import { IPage, ISite } from '@pubstudio/shared/type-site'

export const getOrderedPages = (site: ISite): IPage[] => {
  return site.pageOrder.map((route) => site.pages[route]).filter((route) => !!route) ?? []
}
