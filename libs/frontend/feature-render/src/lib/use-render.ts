import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { findStyles } from '@pubstudio/frontend/util-component'
import {
  queryStyleToString,
  rawStyleRecordToString,
  RenderMode,
} from '@pubstudio/frontend/util-render'
import { Css, IPage, ISite } from '@pubstudio/shared/type-site'
import { Link, Meta, Script, useHead } from '@unhead/vue'
import { Component, computed, ComputedRef, defineComponent, h, Ref } from 'vue'
import {
  getBuildPageStyle,
  getLivePageStyle,
  getRootBackgroundStyle,
} from './get-page-style'
import { getReusableStyle } from './get-reusable-style'
import { renderPage } from './render'

export interface IUseRender {
  ReusableStyle: ReturnType<typeof defineComponent>
  ComponentStyle: ReturnType<typeof defineComponent>
  GoogleFontLink: ReturnType<typeof defineComponent>
  PageContent: ReturnType<typeof defineComponent>
  rootComponentMinHeight: ComputedRef<string>
}

export interface IUseRenderOptions {
  site: Ref<ISite | undefined>
  activePage: Ref<IPage | undefined>
  renderMode: RenderMode
  notFoundComponent: Component
  unhead: boolean
}

export const useRender = (options: IUseRenderOptions): IUseRender => {
  const { site, activePage, notFoundComponent, renderMode, unhead } = options

  const reusableStyle = computed(() => {
    let styleContent = ''
    if (site.value) {
      const reusableStyle = getReusableStyle(site.value.context)
      styleContent = queryStyleToString(site.value.context, reusableStyle)
    }
    return h('style', styleContent)
  })

  const ReusableStyle = defineComponent({
    render() {
      return reusableStyle.value
    },
  })

  const buildPageComponentStyle = computed(() => {
    let styleContent = ''
    if (activePage.value && site.value) {
      const pageStyle = getBuildPageStyle(site.value, activePage.value)
      styleContent = rawStyleRecordToString(pageStyle, site.value.context)
    }
    return h('style', styleContent)
  })

  const livePageComponentStyle = computed(() => {
    let styleContent = ''
    if (activePage.value && site.value) {
      const htmlStyle = getRootBackgroundStyle(site.value.context, activePage.value)
      const pageStyle = getLivePageStyle(site.value.context, activePage.value)
      styleContent =
        queryStyleToString(site.value.context, htmlStyle) +
        queryStyleToString(site.value.context, pageStyle)
    }
    return h('style', styleContent)
  })

  const ComponentStyle = defineComponent({
    render() {
      if (renderMode === RenderMode.Build) {
        return buildPageComponentStyle.value
      } else {
        return livePageComponentStyle.value
      }
    },
  })

  const googleFonts = computed(() => {
    const fonts = Object.values(site.value?.context.theme.fonts ?? {})
    if (!fonts.length) {
      return undefined
    } else {
      // See https://developers.google.com/fonts/docs/css2#multiple_families
      const familyParams = fonts
        .map((font) => {
          const fontName = font.name.replace(' ', '+')
          return `family=${fontName}`
        })
        .join('&')
      return h('link', {
        rel: 'stylesheet',
        href: `https://fonts.googleapis.com/css2?${familyParams}`,
      })
    }
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
      (!activePage.value.public && renderMode !== RenderMode.Build)
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

  if (unhead) {
    const headData = computed(() => {
      const link = [
        ...(site.value?.defaults.head.link ?? []),
        ...(activePage.value?.head.link ?? []),
      ].map((l) => (l.rel === 'icon' ? { ...l, key: 'favicon' } : l))
      return {
        title: activePageName,
        meta: [
          {
            name: 'og:title',
            content: activePageName,
          },
          {
            name: 'twitter:title',
            content: activePageName,
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
  }

  const rootComponentStyle = computed(() => {
    if (!activePage.value || !site.value || renderMode === RenderMode.Release) {
      return undefined
    }
    return findStyles(
      [Css.Height],
      site.value,
      activePage.value.root,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
  })

  const rootComponentMinHeight = computed(() => {
    const { height } = rootComponentStyle.value ?? {}
    if (!height || height === '100%') {
      return '100%'
    } else {
      return 'auto'
    }
  })

  return {
    ReusableStyle,
    ComponentStyle,
    GoogleFontLink,
    PageContent,
    rootComponentMinHeight,
  }
}
