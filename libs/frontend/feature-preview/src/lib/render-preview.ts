import {
  computeAttrsInputsMixins,
  computeEvents,
  IContent,
  IPropsContent,
  parseI18n,
} from '@pubstudio/frontend/feature-render'
import { RenderMode } from '@pubstudio/frontend/util-render'
import { resetRuntimeContext } from '@pubstudio/frontend/util-runtime'
import { IComponent, IPage, ISite } from '@pubstudio/shared/type-site'
import { h, VNode } from 'vue'
import { PreviewComponent } from './preview-component'

export const renderPage = (site: ISite, page: IPage): VNode | undefined => {
  resetRuntimeContext()
  const rootNode = renderComponent(site, page.root, RenderMode.Preview)
  return rootNode
}

export const computePropsContent = (
  site: ISite,
  component: IComponent,
): IPropsContent => {
  const renderMode = RenderMode.Preview
  // TODO -- handle inputs
  const data = computeAttrsInputsMixins(site.context, component, { renderMode })
  const events = computeEvents(site, component)

  const content: IContent = component.children?.length
    ? component.children.map((child) => renderComponent(site, child, renderMode))
    : parseI18n(site, component.content)

  const props = {
    ...data.attrs,
    ...events.native,
    class: data.mixins.concat(component.id),
    id: component.id,
  }

  return {
    content,
    props,
    customEventHandlers: events.custom,
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
  return h(PreviewComponent(), {
    site,
    component,
    renderMode,
  })
}
