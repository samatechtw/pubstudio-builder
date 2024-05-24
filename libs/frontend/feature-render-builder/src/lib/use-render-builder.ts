/* eslint-disable vue/one-component-per-file */
import { useThemeMenuFonts } from '@pubstudio/frontend/feature-build'
import { getBuildPageStyle, IUseRender } from '@pubstudio/frontend/feature-render'
import {
  IUseRenderBuilderHelper,
  useRenderBuilderHelper,
} from '@pubstudio/frontend/feature-render-helpers'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import {
  rawStyleRecordToString,
  renderGoogleFontsLink,
  themeToCssVars,
} from '@pubstudio/frontend/util-render'
import { IPage, ISite, ThemeFontSource } from '@pubstudio/shared/type-site'
import { computed, defineComponent, h, Ref } from 'vue'
import { computeBuilderMixins } from './compute-builder-mixins'
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

  const googleFonts = computed(() => {
    const themeFontNames = Object.values(site.value?.context.theme.fonts ?? {})
      .filter((font) => font.source === ThemeFontSource.Google)
      .map((font) => font.name)

    const fontNames = [...themeFontNames]
    for (const googleFontName of selectedGoogleFonts.value) {
      if (!fontNames.includes(googleFontName)) {
        fontNames.push(googleFontName)
      }
    }

    return renderGoogleFontsLink(fontNames)
  })

  const buildPageComponentStyle = computed(() => {
    let styleContent = ''
    if (activePage.value && site.value) {
      const pageStyle = getBuildPageStyle(site.value, activePage.value)
      styleContent = rawStyleRecordToString(pageStyle, site.value.context)
    }
    return h('style', styleContent)
  })

  const ComponentStyle = defineComponent({
    render() {
      return buildPageComponentStyle.value
    },
  })

  const GoogleFontLink = defineComponent({
    render() {
      return googleFonts.value
    },
  })

  return {
    ...renderUtil,
    ComponentStyle,
    Mixins,
    PageContent,
    GoogleFontLink,
  }
}
