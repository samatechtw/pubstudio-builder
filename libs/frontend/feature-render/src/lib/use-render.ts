import {
  createQueryStyle,
  iterateMixin,
  queryStyleToString,
  rawStyleToResolvedStyle,
  renderGoogleFontsLink,
  RenderMode,
  themeToCssVars,
} from '@pubstudio/frontend/util-render'
import { IPage, ISite, ThemeFontSource } from '@pubstudio/shared/type-site'
import { Link, Meta, Script, useHead } from '@unhead/vue'
import { Component, computed, defineComponent, h, Ref } from 'vue'
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
  GoogleFontLink: ReturnType<typeof defineComponent>
  PageContent: ReturnType<typeof defineComponent>
}

export interface IUseRenderOptions {
  site: Ref<ISite>
  activePage: Ref<IPage | undefined>
  renderMode: RenderMode
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

  const googleFonts = computed(() => {
    const fontNames = Object.values(site.value?.context.theme.fonts ?? {})
      .filter((font) => font.source === ThemeFontSource.Google)
      .map((font) => font.name)
    return renderGoogleFontsLink(fontNames)
  })

  const GoogleFontLink = defineComponent({
    render() {
      return googleFonts.value
    },
  })

  const getPageContent = () => {
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
  }
  const pageContent = computed(() => {
    return getPageContent()
  })

  const PageContent = defineComponent({
    render() {
      return pageContent.value
    },
  })

  const activePageName = computed(() => {
    const pageName = activePage.value?.name || ''
    if (!pageName || !activePage.value?.public) {
      return 'Pub Studio'
    }
    return pageName
  })

  const headData = computed(() => {
    const link = [
      ...(site.value?.defaults.head.link ?? []),
      ...(activePage.value?.head.link ?? []),
    ].map((l) => (l.rel === 'icon' ? { ...l, key: 'favicon' } : l))

    const activePageTitle = activePage.value?.head.title || activePageName

    return {
      title: activePageTitle,
      meta: [
        {
          name: 'og:title',
          content: activePageTitle,
        },
        {
          name: 'twitter:title',
          content: activePageTitle,
        },
        ...((site.value?.defaults.head.meta ?? []) as Meta[]),
        ...((activePage.value?.head.meta ?? []) as Meta[]),
      ],
      link: link as Link[],
      script: [
        ...((site.value?.defaults.head.script ?? []) as Script[]),
        ...((activePage.value?.head.script ?? []) as Script[]),
      ],
    }
  })
  useHead(headData)

  return {
    CustomStyle,
    Mixins,
    ComponentStyle,
    GoogleFontLink,
    PageContent,
  }
}
