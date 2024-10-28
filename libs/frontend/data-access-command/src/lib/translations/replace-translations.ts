import { clone } from '@pubstudio/frontend/util-component'
import { IReplaceTranslationsData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const applyReplaceTranslations = (site: ISite, data: IReplaceTranslationsData) => {
  const { newTranslations } = data
  site.context.i18n = clone(newTranslations)
}

export const undoReplaceTranslations = (site: ISite, data: IReplaceTranslationsData) => {
  const { oldTranslations } = data
  site.context.i18n = clone(oldTranslations)
}
