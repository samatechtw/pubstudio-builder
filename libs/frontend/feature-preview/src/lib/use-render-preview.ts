import {
  IUseRender,
  IUseRenderOptions,
  useRender,
} from '@pubstudio/frontend/feature-render'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import { computed, defineComponent, h } from 'vue'
import { renderPage } from './render-preview'

export const useRenderPreview = (options: IUseRenderOptions): IUseRender => {
  const { site, activePage, renderMode } = options
  const render = useRender(options)

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
    PageContent,
  }
}
