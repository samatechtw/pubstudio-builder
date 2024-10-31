import { IContent, IPropsContent, RenderMode } from '@pubstudio/frontend/util-render'
import { resetRuntimeContext } from '@pubstudio/frontend/util-runtime'
import { IComponent, IPage, ISite } from '@pubstudio/shared/type-site'
import { h, VNode } from 'vue'
import { computeAttrsInputsMixins } from './compute-attrs-inputs-mixins'
import { LiveComponent } from './live-component'
import { computeEvents, parseI18n } from './render-helpers'

export const renderPage = (
  site: ISite,
  page: IPage,
  renderMode: RenderMode,
): VNode | undefined => {
  resetRuntimeContext()
  const rootNode = renderComponent(site, page.root, renderMode)
  return rootNode
}

export const computePropsContent = (
  site: ISite,
  component: IComponent,
  renderMode: RenderMode,
): IPropsContent => {
  const data = computeAttrsInputsMixins(site.context, component, { renderMode })
  const events = computeEvents(site, component)

  const active = site.context.activeI18n ?? 'en'

  const content: IContent = component.children?.length
    ? component.children.map((child) => renderComponent(site, child, renderMode))
    : parseI18n(site.context.i18n, active, data.content)

  const props = {
    ...data.attrs,
    ...events.native,
    class: data.mixins.concat(component.id),
    id: component.id,
  }

  return {
    content,
    props,
  }
}

export const renderComponent = (
  site: ISite,
  component: IComponent,
  renderMode: RenderMode,
): VNode | undefined => {
  if (component.state?.hide) {
    return undefined
  }
  return h(LiveComponent(), {
    site,
    component,
    renderMode,
  })
}
