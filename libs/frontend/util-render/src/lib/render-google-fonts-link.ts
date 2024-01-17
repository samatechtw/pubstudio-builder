import { h } from 'vue'

export const renderGoogleFontsLink = (fontNames: string[]) => {
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
