import { ICustomTableEvent } from './i-custom-table.view-model'

export interface IUpdateTableApiRequest {
  old_name: string
  new_name?: string
  events?: ICustomTableEvent[]
}
