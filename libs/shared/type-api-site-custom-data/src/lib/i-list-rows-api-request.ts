import { Action } from './enum-action'

export interface IListRowsApiRequest {
  action: Action.ListRows
  data: IListRowsQuery
}

export interface IListRowsQuery {
  table_name: string
  from?: number
  to?: number
}
