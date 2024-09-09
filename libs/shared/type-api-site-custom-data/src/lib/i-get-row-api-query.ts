import { IRowFilters } from './i-row-filter'

export interface IGetRowApiQuery {
  table_name: string
  filters?: IRowFilters
}
