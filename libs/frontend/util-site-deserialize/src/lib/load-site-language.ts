import { LANG_STORAGE_ID } from '@pubstudio/frontend/util-defaults'
import { ISite } from '@pubstudio/shared/type-site'

const getNavigatorLanguage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = navigator as any
  if (nav?.languages.length) {
    return nav.languages[0]
  } else {
    return nav.userLanguage || nav.language || nav.browserLanguage || 'en'
  }
}

export const loadSiteLanguage = (site: ISite) => {
  const lang = localStorage.getItem(LANG_STORAGE_ID)
  // Language preference has been set
  if (lang) {
    site.context.activeI18n = lang
  } else {
    const userLang = getNavigatorLanguage()
    const langs = Object.keys(site.context.i18n)
    // Navigator language is in site translations
    if (langs.includes(userLang)) {
      site.context.activeI18n = userLang
      // Simplified navigator language
    } else {
      if (userLang.includes('-')) {
        const userSimple = userLang.split('-')[0]
        if (langs.includes(userSimple)) {
          site.context.activeI18n = userSimple
        } else {
          site.context.activeI18n = 'en'
        }
      }
    }
  }
}
