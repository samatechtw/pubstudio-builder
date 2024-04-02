import { CustomDataAction } from './enum-custom-data-action'

export interface ICustomDataApiRequest {
  action: CustomDataAction
  data: unknown
}
