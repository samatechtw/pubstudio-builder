import { useThemeMenuFonts } from '@pubstudio/frontend/feature-build'
/* eslint-disable vue/one-component-per-file */
import {
  IUseRender,
  IUseRenderOptions,
  useRender,
} from '@pubstudio/frontend/feature-render'
import { NotFound } from '@pubstudio/frontend/ui-widgets'
import {
  rawStyleRecordToString,
  renderGoogleFontsLink,
  themeToCssVars,
} from '@pubstudio/frontend/util-render'
import { computed, defineComponent, h } from 'vue'
import { computeBuilderReusableStyles } from './compute-builder-reusable-styles'
import { renderPage } from './render-builder'

export const useRenderBuilder = (options: IUseRenderOptions): IUseRender => {
  const { site, activePage } = options
  const render = useRender(options)
  const { selectedGoogleFonts } = useThemeMenuFonts()

  const reusableStyle = computed(() => {
    let styleContent = ''
    if (site.value) {
      // Add theme colors as CSS variables for use in ProseMirror editor
      styleContent = themeToCssVars(site.value.context.theme)

      const rawStyleRecord = computeBuilderReusableStyles(site.value)
      styleContent += rawStyleRecordToString(rawStyleRecord, site.value.context)
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

  const googleFonts = computed(() => {
    const themeFontNames = Object.values(site.value?.context.theme.fonts ?? {}).map(
      (font) => font.name,
    )

    const fontNames = [...themeFontNames]
    for (const googleFontName of selectedGoogleFonts.value) {
      if (!fontNames.includes(googleFontName)) {
        fontNames.push(googleFontName)
      }
    }

    return renderGoogleFontsLink(fontNames)
  })

  const GoogleFontLink = defineComponent({
    render() {
      return googleFonts.value
    },
  })

  return {
    ...render,
    ReusableStyle,
    PageContent,
    GoogleFontLink,
  }
}
