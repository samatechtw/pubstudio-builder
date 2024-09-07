import { ICustomTableColumn, ICustomTableEvent } from './i-custom-table.view-model'

export interface ICreateTableApiRequest {
  table_name: string
  columns: Record<string, ICustomTableColumn>
  events: ICustomTableEvent[]
}
