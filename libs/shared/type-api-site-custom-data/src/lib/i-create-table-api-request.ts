import { ICustomTableColumn } from './i-custom-table.view-model'

export interface ICreateTableApiRequest {
  table_name: string
  columns: Record<string, Omit<ICustomTableColumn, 'name'>>
}
