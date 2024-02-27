import { ISite } from '@pubstudio/shared/type-site'

export const getPreviewLink = (
  site: ISite,
  siteId: string,
  extraQuery?: Record<string, string>,
) => {
  const page = site.editor?.active ?? site.defaults.homePage
  return {
    name: 'Preview',
    params: { pathMatch: page.replace(/^\//, '') },
    query: { siteId, ...extraQuery },
  }
}
