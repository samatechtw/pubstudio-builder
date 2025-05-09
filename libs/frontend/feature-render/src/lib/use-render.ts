import {
  createQueryStyle,
  iterateMixin,
  queryStyleToString,
  rawStyleToResolvedStyle,
  renderCustomFontLink,
  renderGoogleFontLinks,
  RenderModeType,
  themeToCssVars,
} from '@pubstudio/frontend/util-render'
import { IPage, ISite } from '@pubstudio/shared/type-site'
import { Component, computed, defineComponent, h, Ref, VNode } from 'vue'
import {
  getGlobalStyle,
  getLivePageStyle,
  getRootBackgroundStyle,
} from './get-page-style'
import { renderPage } from './render'

export interface IUseRender {
  CustomStyle: ReturnType<typeof defineComponent>
  Mixins: ReturnType<typeof defineComponent>
  ComponentStyle: ReturnType<typeof defineComponent>
  FontLinks: ReturnType<typeof defineComponent>
  PageContent: ReturnType<typeof defineComponent>
}

export interface IUseRenderOptions {
  site: Ref<ISite>
  activePage: Ref<IPage | undefined>
  renderMode: RenderModeType
  notFoundComponent: Component
}

export const useRender = (options: IUseRenderOptions): IUseRender => {
  const { site, activePage, notFoundComponent, renderMode } = options

  const mixinStyle = computed(() => {
    let styleContent = ''
    if (site.value) {
      // Add theme colors as CSS variables for use in ProseMirror editor
      styleContent = themeToCssVars(site.value.context.theme)

      const queryStyle = createQueryStyle(site.value.context)

      for (const mixinId of site.value.context.styleOrder) {
        iterateMixin(site.value.context, mixinId, (bpId, pseudoClass, rawStyle) => {
          const resolvedStyle = rawStyleToResolvedStyle(site.value.context, rawStyle)
          queryStyle[bpId][`.${mixinId}${pseudoClass}`] = resolvedStyle
        })
      }

      styleContent += queryStyleToString(site.value.context, queryStyle)
    }
    return h('style', styleContent)
  })

  const Mixins = defineComponent({
    render() {
      return mixinStyle.value
    },
  })

  const livePageComponentStyle = computed(() => {
    let styleContent = ''
    let customContent = ''
    const context = site.value?.context
    if (activePage.value && context) {
      const globalStyle = getGlobalStyle(context)
      const htmlStyle = getRootBackgroundStyle(context, activePage.value)
      const pageStyle = getLivePageStyle(context, activePage.value)
      customContent =
        globalStyle +
        queryStyleToString(context, htmlStyle) +
        queryStyleToString(context, pageStyle.custom)
      styleContent = queryStyleToString(context, pageStyle.component)
    }
    return {
      component: h('style', styleContent),
      custom: h('style', customContent),
    }
  })

  const CustomStyle = defineComponent({
    render() {
      return livePageComponentStyle.value.custom
    },
  })

  const ComponentStyle = defineComponent({
    render() {
      return livePageComponentStyle.value.component
    },
  })

  const fontLinks = computed(() => {
    const googleFonts: string[] = []
    const customFonts: VNode[] = []
    for (const font of Object.values(site.value?.context.theme.fonts ?? {})) {
      if (font.source === 'google') {
        googleFonts.push(font.name)
      } else if (font.source === 'custom') {
        const link = renderCustomFontLink(font)
        if (link) {
          customFonts.push(link)
        }
      }
    }
    return [renderGoogleFontLinks(googleFonts), ...customFonts]
  })

  const FontLinks = defineComponent({
    render() {
      return fontLinks.value
    },
  })

  const pageContent = computed(() => {
    if (
      !site.value ||
      !activePage.value ||
      // Private pages are only visible in build mode
      !activePage.value.public
    ) {
      return h(notFoundComponent)
    }
    const page = renderPage(site.value, activePage.value, renderMode)
    return h(page ?? 'div')
  })

  const PageContent = defineComponent({
    render() {
      return pageContent.value
    },
  })

  return {
    CustomStyle,
    Mixins,
    ComponentStyle,
    FontLinks,
    PageContent,
  }
}
