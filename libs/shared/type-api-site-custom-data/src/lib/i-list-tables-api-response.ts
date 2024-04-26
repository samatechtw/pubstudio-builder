import { ICustomTableViewModel } from './i-custom-table.view-model'

export interface IListTablesResponse {
  total: number
  results: ICustomTableViewModel[]
}
