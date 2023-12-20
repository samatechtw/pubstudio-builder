import {
  INewTranslations,
  ISetTranslationsData,
} from '@pubstudio/shared/type-command-data'
import { ISiteContext, ITranslations } from '@pubstudio/shared/type-site'

export const makeSetTranslationsData = (
  context: ISiteContext,
  code: string,
  translations: INewTranslations | undefined,
): ISetTranslationsData => {
  const original = context.i18n[code]

  if (!original) {
    // No previous translations means we add them all
    return { code, newTranslations: translations }
  } else if (!translations) {
    // Undefined translations means clear all
    return { code, oldTranslations: context.i18n[code] }
  } else {
    // Deleted and modified translations are included in oldTranslations
    const oldTranslations: ITranslations = {}
    for (const [key, val] of Object.entries(translations)) {
      if (original[key] !== undefined && val !== original[key]) {
        oldTranslations[key] = original[key]
      }
    }
    return {
      code,
      oldTranslations,
      newTranslations: translations,
    }
  }
}
