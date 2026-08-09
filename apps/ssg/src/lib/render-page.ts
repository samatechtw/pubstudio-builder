import { createStaticSiteApp } from '@pubstudio/frontend/feature-render'
import { IPage, ISite } from '@pubstudio/shared/type-site'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp, shallowRef } from 'vue'

export const renderPageBody = async (site: ISite, page: IPage): Promise<string> => {
  const siteRef = shallowRef(site)
  const pageRef = shallowRef<IPage | undefined>(page)
  const { App } = createStaticSiteApp(siteRef, pageRef)
  return renderToString(createSSRApp(App))
}
