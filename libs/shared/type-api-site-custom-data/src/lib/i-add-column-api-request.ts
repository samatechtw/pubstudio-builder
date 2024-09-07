import { ICustomTableColumn } from './i-custom-table.view-model'

export interface IAddColumnApiRequest {
  table_name: string
  column: Record<string, ICustomTableColumn>
}
