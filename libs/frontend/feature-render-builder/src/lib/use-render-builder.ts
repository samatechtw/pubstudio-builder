/* eslint-disable vue/one-component-per-file */
import { useThemeMenuFonts } from '@pubstudio/frontend/feature-build'
import { getGlobalStyle, IUseRender } from '@pubstudio/frontend/feature-render'
import {
  IUseRenderBuilderHelper,
  useRenderBuilderHelper,
} from '@pubstudio/frontend/feature-render-helpers'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import {
  rawStyleRecordToString,
  renderCustomFontLink,
  renderGoogleFontLinks,
  themeToCssVars,
} from '@pubstudio/frontend/util-render'
import { IPage, ISite, ThemeFontSource } from '@pubstudio/shared/type-site'
import { computed, defineComponent, h, Ref, VNode } from 'vue'
import { computeBuilderMixins } from './compute-builder-mixins'
import { getBuildPageStyle } from './get-build-page-style'
import { renderPage } from './render-builder'

export interface IUseRenderBuilderOptions {
  site: Ref<ISite | undefined>
  activePage: Ref<IPage | undefined>
}

export const useRenderBuilder = (
  options: IUseRenderBuilderOptions,
): IUseRender & IUseRenderBuilderHelper => {
  const { site, activePage } = options
  const { selectedGoogleFonts } = useThemeMenuFonts()
  const renderUtil = useRenderBuilderHelper(options)

  const mixinStyle = computed(() => {
    let styleContent = ''
    if (site.value) {
      // Add theme colors as CSS variables for use in ProseMirror editor
      styleContent = themeToCssVars(site.value.context.theme)

      const rawStyleRecord = computeBuilderMixins(site.value)
      styleContent += rawStyleRecordToString(rawStyleRecord, site.value.context)
    }
    return h('style', styleContent)
  })

  const Mixins = defineComponent({
    render() {
      return mixinStyle.value
    },
  })

  const pageContent = computed(() => {
    if (!site.value || !activePage.value) {
      return h(NotFound)
    }
    const page = renderPage(site.value, activePage.value)
    return h(page ?? 'div')
  })

  const PageContent = defineComponent({
    render() {
      return pageContent.value
    },
  })

  const fontLinks = computed(() => {
    const googleFonts: string[] = []
    const customFonts: VNode[] = []

    for (const font of Object.values(site.value?.context.theme.fonts ?? {})) {
      if (font.source === ThemeFontSource.Google) {
        googleFonts.push(font.name)
      } else if (font.source === ThemeFontSource.Custom) {
        const link = renderCustomFontLink(font)
        if (link) {
          customFonts.push(link)
        }
      }
    }

    for (const googleFontName of selectedGoogleFonts.value) {
      if (!googleFonts.includes(googleFontName)) {
        googleFonts.push(googleFontName)
      }
    }

    return [renderGoogleFontLinks(googleFonts), ...customFonts]
  })

  const buildPageComponentStyle = computed(() => {
    let styleContent = ''
    let customContent = ''
    if (activePage.value && site.value) {
      const globalStyle = getGlobalStyle(site.value.context)
      const pageStyle = getBuildPageStyle(site.value, activePage.value)
      customContent = rawStyleRecordToString(pageStyle.custom, site.value.context)
      styleContent =
        globalStyle + rawStyleRecordToString(pageStyle.component, site.value.context)
    }
    return {
      component: h('style', styleContent),
      custom: h('style', customContent),
    }
  })

  const CustomStyle = defineComponent({
    render() {
      return buildPageComponentStyle.value.custom
    },
  })

  const ComponentStyle = defineComponent({
    render() {
      return buildPageComponentStyle.value.component
    },
  })

  const FontLinks = defineComponent({
    render() {
      return fontLinks.value
    },
  })

  return {
    ...renderUtil,
    CustomStyle,
    ComponentStyle,
    Mixins,
    PageContent,
    FontLinks,
  }
}
