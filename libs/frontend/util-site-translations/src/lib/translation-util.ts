import { IMultiselectObj } from '@pubstudio/frontend/type-ui-widgets'
import { ISiteContext } from '@pubstudio/shared/type-site'
import { languageDict } from './supported-languages'

export const DEFAULT_LANGUAGE = 'en'

export const makeLanguageOption = (key: string): IMultiselectObj => {
  return { label: languageDict[key], value: key }
}

export const getCurrentLanguages = (context: ISiteContext): IMultiselectObj[] => {
  let langs = Object.keys(context.i18n).map(makeLanguageOption)
  if (!context.i18n[DEFAULT_LANGUAGE]) {
    langs = [makeLanguageOption(DEFAULT_LANGUAGE), ...langs]
  }
  return langs
}
