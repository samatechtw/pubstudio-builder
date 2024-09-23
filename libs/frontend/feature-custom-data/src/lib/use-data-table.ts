import { useCustomDataApi } from '@pubstudio/frontend/data-access-api'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { parseApiErrorKey, toApiError } from '@pubstudio/frontend/util-api'
import { AdminTablePageSize } from '@pubstudio/frontend/util-fields'
import {
  ICustomTableColumn,
  ICustomTableRow,
} from '@pubstudio/shared/type-api-site-custom-data'
import { computed, ComputedRef, Ref, ref } from 'vue'
import { IEditColumnName } from './i-edit-column'

export interface IUseDataTableFeature {
  page: Ref<number>
  total: Ref<number>
  pageSize: Ref<AdminTablePageSize>
  maxPage: ComputedRef<number>
  from: ComputedRef<number>
  to: ComputedRef<number>
  loadingRows: Ref<boolean>
  errorKey: Ref<string | undefined>
  rows: Ref<ICustomTableRow[]>
  newRow: Ref<ICustomTableRow | undefined>
  editRow: Ref<ICustomTableRow | undefined>
  setPageSize: (pageSize: AdminTablePageSize) => void
  listRows: (tableName: string) => Promise<void>
  addRow: (tableName: string, row: ICustomTableRow) => Promise<void>
  updateRow: (tableName: string, row: ICustomTableRow) => Promise<void>
  deleteRow: (tableName: string, index: number) => Promise<void>
  modifyColumn: (tableName: string, info: IEditColumnName) => Promise<void>
  addColumn: (tableName: string, info: ICustomTableColumn) => Promise<void>
  deleteTable: (tableName: string) => Promise<void>
}

const errorKey = ref()

export const useDataTable = (siteId: Ref<string>): IUseDataTableFeature => {
  const { apiSite } = useSiteSource()
  const api = useCustomDataApi(siteId.value)
  const page = ref(1)
  const total = ref(0)
  const pageSize = ref<AdminTablePageSize>(25)
  const loadingRows = ref(false)
  const newRow = ref<ICustomTableRow>()
  const editRow = ref<ICustomTableRow>()
  const rows = ref<ICustomTableRow[]>([])

  const maxPage = computed(() => Math.ceil(total.value / (pageSize.value || 1)))

  const from = computed(() => (page.value - 1) * pageSize.value + 1)
  const to = computed(() => from.value + pageSize.value - 1)

  const setPageSize = (value: AdminTablePageSize) => {
    pageSize.value = value
    page.value = 1
  }

  const listRows = async (tableName: string) => {
    errorKey.value = undefined
    if (!apiSite) {
      return
    }
    loadingRows.value = true
    try {
      const response = await api.listRows(apiSite, {
        table_name: tableName,
        from: from.value,
        to: to.value,
      })
      rows.value = response.results
      total.value = response.total
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    }
    loadingRows.value = false
  }

  const addRow = async (tableName: string, row: ICustomTableRow) => {
    errorKey.value = undefined
    if (!apiSite) {
      return
    }
    loadingRows.value = true

    try {
      const result = await api.addRow(apiSite, { table_name: tableName, row })
      rows.value.unshift({ ...row, id: result.id })
      newRow.value = undefined
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    }
    loadingRows.value = false
  }

  const updateRow = async (tableName: string, row: ICustomTableRow) => {
    errorKey.value = undefined
    const { id, ...rowData } = row
    if (!apiSite || !id) {
      return
    }
    loadingRows.value = true
    const rowId = typeof id === 'number' ? id : parseInt(id)

    try {
      await api.updateRow(apiSite, {
        table_name: tableName,
        row_id: rowId,
        new_row: rowData,
      })
      const rowIndex = rows.value.findIndex((r) => r.id === id)
      if (rowIndex !== -1) {
        rows.value[rowIndex] = { ...rows.value[rowIndex], ...rowData }
      }
      editRow.value = undefined
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    }
    loadingRows.value = false
  }

  const deleteRow = async (tableName: string, index: number) => {
    errorKey.value = undefined
    const row = rows.value[index]
    if (!apiSite || !row) {
      return
    }
    loadingRows.value = true

    try {
      await api.removeRow(apiSite, { table_name: tableName, row_id: row.id.toString() })
      rows.value.splice(index, 1)
      newRow.value = undefined
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    }
    loadingRows.value = false
  }

  const modifyColumn = async (tableName: string, info: IEditColumnName) => {
    errorKey.value = undefined
    if (!apiSite) {
      return
    }
    loadingRows.value = true

    try {
      await api.modifyColumn(apiSite, {
        table_name: tableName,
        old_column_name: info.oldName,
        new_column_name: info.newName,
      })
      newRow.value = undefined
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    }
    loadingRows.value = false
  }

  const addColumn = async (tableName: string, info: ICustomTableColumn) => {
    errorKey.value = undefined
    if (!apiSite) {
      return
    }
    loadingRows.value = true

    try {
      await api.addColumn(apiSite, {
        table_name: tableName,
        column: { [info.name]: info },
      })
      newRow.value = undefined
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    }
    loadingRows.value = false
  }

  const deleteTable = async (tableName: string) => {
    errorKey.value = undefined
    if (!apiSite) {
      return
    }
    loadingRows.value = true

    try {
      await api.deleteTable(apiSite, { table_name: tableName })
      newRow.value = undefined
    } catch (e) {
      errorKey.value = parseApiErrorKey(toApiError(e))
    }
    loadingRows.value = false
  }

  return {
    page,
    total,
    pageSize,
    maxPage,
    from,
    to,
    loadingRows,
    errorKey,
    newRow,
    editRow,
    rows,
    setPageSize,
    listRows,
    addRow,
    updateRow,
    deleteRow,
    modifyColumn,
    addColumn,
    deleteTable,
  }
}
