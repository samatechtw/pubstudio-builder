/* eslint-disable vue/one-component-per-file */
import {
  IUseRender,
  IUseRenderOptions,
  useRender,
  getReusableStyle,
} from '@pubstudio/frontend/feature-render'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import { computed, defineComponent, h } from 'vue'
import { renderPage } from './render-builder'
import { IRawStyleRecord, rawStyleRecordToString } from '@pubstudio/frontend/util-render'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { Css } from '@pubstudio/shared/type-site'

export const useRenderBuilder = (options: IUseRenderOptions): IUseRender => {
  const { site, activePage } = options
  const render = useRender(options)

  const reusableStyle = computed(() => {
    let styleContent = ''
    if (site.value) {
      const reusableStyle = getReusableStyle(site.value.context)
      const rawStyleRecord: IRawStyleRecord = {}
      for (const bp of descSortedBreakpoints.value) {
        const bpStyle = reusableStyle[bp.id]
        Object.entries(bpStyle).forEach(([cssSelector, rawStyle]) => {
          if (!rawStyleRecord[cssSelector]) {
            rawStyleRecord[cssSelector] = {}
          }
          Object.entries(rawStyle).forEach(([prop, value]) => {
            rawStyleRecord[cssSelector][prop as Css] = value
          })
        })
        if (bp.id === activeBreakpoint.value.id) {
          break
        }
      }
      styleContent = rawStyleRecordToString(rawStyleRecord, site.value.context)
    }
    return h('style', styleContent)
  })

  const ReusableStyle = defineComponent({
    render() {
      return reusableStyle.value
    },
  })

  const getPageContent = () => {
    if (!site.value || !activePage.value) {
      return h(NotFound)
    }
    const page = renderPage(site.value, activePage.value)
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
    ReusableStyle,
    PageContent,
  }
}
