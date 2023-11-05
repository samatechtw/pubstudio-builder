import { ISetTranslationsData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const applySetTranslations = (site: ISite, data: ISetTranslationsData) => {
  const { code, newTranslations, oldTranslations } = data
  if (!newTranslations) {
    delete site.context.i18n[code]
    return
  }
  if (!oldTranslations) {
    site.context.i18n[code] = {}
  }
  for (const [key, val] of Object.entries(newTranslations)) {
    if (val === undefined) {
      delete site.context.i18n[code][key]
    } else {
      site.context.i18n[code][key] = val
    }
  }
}

export const undoSetTranslations = (site: ISite, data: ISetTranslationsData) => {
  const { code, oldTranslations, newTranslations } = data
  if (!oldTranslations) {
    delete site.context.i18n[code]
    return
  }
  if (!newTranslations) {
    site.context.i18n[code] = { ...oldTranslations }
    return
  }
  for (const key of Object.keys(newTranslations)) {
    const oldVal = oldTranslations[key]
    if (!oldVal) {
      delete site.context.i18n[code][key]
    } else {
      site.context.i18n[code][key] = oldVal
    }
  }
}
