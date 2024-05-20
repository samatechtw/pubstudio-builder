import {
  IUseRender,
  IUseRenderOptions,
  useRender,
} from '@pubstudio/frontend/feature-render'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import {
  IUseRenderBuilderUtil,
  useRenderBuilderUtil,
} from '@pubstudio/frontend/util-render-builder'
import { computed, defineComponent, h } from 'vue'
import { renderPage } from './render-preview'

export const useRenderPreview = (
  options: IUseRenderOptions,
): IUseRender & IUseRenderBuilderUtil => {
  const { site, activePage, renderMode } = options
  const render = useRender(options)
  const renderUtil = useRenderBuilderUtil({ site, activePage })

  const getPageContent = () => {
    if (!site.value || !activePage.value) {
      return h(NotFound)
    }
    const page = renderPage(site.value, activePage.value, renderMode)
    return h(page ?? 'div')
  }
  const pageContent = computed(() => {
    return getPageContent()
  })

  const PageContent = defineComponent({
    render() {
      return pageContent.value
    },
  })

  return {
    ...render,
    ...renderUtil,
    PageContent,
  }
}
