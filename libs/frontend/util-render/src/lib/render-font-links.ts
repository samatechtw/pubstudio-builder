import { IThemeFont } from '@pubstudio/shared/type-site'
import { h, VNode } from 'vue'

export const renderGoogleFontLinks = (fontNames: string[]) => {
  if (!fontNames.length) {
    return undefined
  } else {
    // See https://developers.google.com/fonts/docs/css2#multiple_families
    const familyParams = fontNames
      .map((name) => {
        const fontName = name.replace(/\s/g, '+')
        return `family=${fontName}`
      })
      .join('&')
    return h('link', {
      rel: 'stylesheet',
      href: `https://fonts.googleapis.com/css2?${familyParams}`,
    })
  }
}

export const renderCustomFontLink = (font: IThemeFont): VNode | undefined => {
  if (font.url) {
    return h('style', `@font-face {font-family: ${font.name};src: url('${font.url}');}`)
  }
  return undefined
}
