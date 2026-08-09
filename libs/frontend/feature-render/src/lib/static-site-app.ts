import { IPage, ISite } from '@pubstudio/shared/type-site'
import { Component, defineComponent, h, Ref } from 'vue'
import { StaticNotFound } from './static-not-found'
import { IUseRender, useRender } from './use-render'

export interface IStaticSiteApp {
  App: ReturnType<typeof defineComponent>
  // Exposed for router setup in the hydration runtime (setupRoutes)
  render: IUseRender
}

// Root component shared by the SSG prerender (via @vue/server-renderer) and
// the hydration runtime (via createSSRApp). Both sides render this exact
// component in `static` mode, so the prerendered markup and the hydrating
// client's markup match by construction.
// The child order must not change: it defines the prerendered DOM structure.
export const createStaticSiteApp = (
  site: Ref<ISite>,
  activePage: Ref<IPage | undefined>,
  notFoundComponent?: Component,
): IStaticSiteApp => {
  const render = useRender({
    site,
    activePage,
    renderMode: 'static',
    notFoundComponent: notFoundComponent ?? StaticNotFound,
  })
  const { CustomStyle, Mixins, ComponentStyle, FontLinks, PageContent } = render
  const App = defineComponent({
    name: 'StaticSiteApp',
    render() {
      return [h(CustomStyle), h(Mixins), h(ComponentStyle), h(FontLinks), h(PageContent)]
    },
  })
  return { App, render }
}
