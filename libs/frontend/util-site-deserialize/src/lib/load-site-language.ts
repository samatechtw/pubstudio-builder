import { LANG_STORAGE_ID } from '@pubstudio/frontend/util-defaults'
import { ISite } from '@pubstudio/shared/type-site'

export const loadSiteLanguage = (site: ISite) => {
  const lang = localStorage.getItem(LANG_STORAGE_ID)
  if (lang) {
    site.context.activeI18n = lang
  }
}
