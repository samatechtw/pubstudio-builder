import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import { saveFile } from '@pubstudio/frontend/util-doc'
import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'
import { format } from 'date-fns/format'
import { useI18n } from 'petite-vue-i18n'
import { ref, Ref } from 'vue'

export interface IUseExportTable {
  exporting: Ref<boolean>
  exportError: Ref<string | undefined>
  exportTable: (
    fileName: string,
    tableName: string | undefined,
    columns: ICustomTableColumn[],
  ) => Promise<void>
}

export const defaultFileName = (tableName: string | undefined): string => {
  const date = format(new Date(), 'yyyyMMdd-HHmmss')
  return `${tableName}-${date}.csv`
}

export const useExportTable = (siteId: string): IUseExportTable => {
  const { apiSite } = useSiteSource()
  const i18n = useI18n()
  const api = useCustomDataApi(siteId)
  const exporting = ref(false)
  const exportError = ref()

  const exportTable = async (
    fileName: string,
    tableName: string | undefined,
    columns: ICustomTableColumn[],
  ) => {
    if (!apiSite || !tableName) {
      return
    }
    exporting.value = true
    let tableString = ''
    try {
      const response = await api.listRows(apiSite, {
        table_name: tableName,
        from: 1,
        to: 100000,
      })
      const columnNames = columns.map((c) => c.name)
      tableString = `"${columnNames.join('","')}"\n`
      for (const row of response.results) {
        const rowString = columnNames.map((col) => row[col]).join('","')
        tableString += `"${rowString}"\n`
      }
    } catch (e) {
      exportError.value = parseApiError(i18n, toApiError(e))
    }
    exporting.value = false

    saveFile(fileName, tableString, 'csv')
  }

  return {
    exporting,
    exportError,
    exportTable,
  }
}
