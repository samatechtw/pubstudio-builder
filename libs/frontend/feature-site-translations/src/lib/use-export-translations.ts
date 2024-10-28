import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import { saveFile } from '@pubstudio/frontend/util-doc'
import { ITranslations } from '@pubstudio/shared/type-site'
import { formatRow } from '@pubstudio/shared/util-format'
import { format } from 'date-fns/format'
import { useI18n } from 'petite-vue-i18n'
import { ref, Ref } from 'vue'

export interface IUseExportTranslations {
  exporting: Ref<boolean>
  exportError: Ref<string | undefined>
  exportTranslations: (
    fileName: string,
    translations: Record<string, ITranslations>,
  ) => Promise<void>
}

export const getLangIndexes = (langs: string[]): Record<string, number> => {
  const langIndexes: Record<string, number> = {}
  for (let i = 0; i < langs.length; i += 1) {
    langIndexes[langs[i]] = i
  }
  return langIndexes
}

export const defaultFileName = (siteName: string | undefined): string => {
  const date = format(new Date(), 'yyyyMMdd-HHmmss')
  return `${siteName}-${date}_i18n.csv`
}

export const useExportTranslations = (): IUseExportTranslations => {
  const i18n = useI18n()
  const exporting = ref(false)
  const exportError = ref()

  const exportTranslations = async (
    fileName: string,
    translations: Record<string, ITranslations>,
  ) => {
    exporting.value = true
    try {
      const langs = Object.keys(translations)
      const langIndexes = getLangIndexes(langs)
      const keys: Record<string, string[]> = {}
      for (const [lang, entries] of Object.entries(translations)) {
        for (const [key, entry] of Object.entries(entries)) {
          if (!keys[key]) {
            keys[key] = Array(langs.length).fill('')
          }
          keys[key][langIndexes[lang]] = entry
        }
      }
      let tableString = formatRow(['key', ...langs])
      for (const [key, i18nRow] of Object.entries(keys)) {
        tableString += formatRow([key, ...i18nRow])
      }
      saveFile(fileName, tableString, 'csv')
    } catch (e) {
      console.log('ERROR', e)
      exportError.value = parseApiError(i18n, toApiError(e))
    }
    exporting.value = false
  }

  return {
    exporting,
    exportError,
    exportTranslations,
  }
}
