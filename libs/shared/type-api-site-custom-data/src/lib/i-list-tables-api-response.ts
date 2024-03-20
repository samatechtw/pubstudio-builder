import { ICustomDataInfoViewModel } from './i-custom-data-info.view-model'

export interface IListTablesResponse {
  total: number
  results: ICustomDataInfoViewModel[]
}
