import { Action } from './enum-action'

export interface IListTablesApiRequest {
  action: Action.ListTables
  data: IListTablesQuery
}

export interface IListTablesQuery {
  from?: number
  to?: number
}
