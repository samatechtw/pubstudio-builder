import { ICustomTableColumn } from './i-custom-table.view-model'

export interface IModifyColumnApiRequest {
  table_name: string
  old_column_name: string
  new_column_name?: string
  new_column_info?: Omit<ICustomTableColumn, 'name'>
}
