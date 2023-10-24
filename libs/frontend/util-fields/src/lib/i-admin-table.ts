import { IDropdownMenuItem } from '@pubstudio/frontend/type-ui-widgets'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IAdminTableItem = Record<string, any>

export type IAdminTableActionEvent = () => void

export type IAdminTableAction = (click?: IAdminTableActionEvent) => IDropdownMenuItem

export type IAdminTableActions<ActionName extends string, TableItem> = {
  getAll(row: TableItem): Record<ActionName, IAdminTableAction>
}

export interface ITableSort {
  order: string
  sort: 'asc' | 'desc'
}

export type AdminTablePageSize = 25 | 50 | 100

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Column<TableItem = any> {
  label: string
  slot?: string
  field?: string
  width?: string
  sortable?: boolean
  isKey?: boolean
  display?: (item: TableItem) => string
}

export interface IAdminTableQueryCommon {
  from: number
  to: number
}

export interface IAdminTablePagination {
  total: number
  page: number
  pageSize: AdminTablePageSize
}
