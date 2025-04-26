import { CustomDataActionType } from './enum-custom-data-action'

export interface ICustomDataApiRequest {
  action: CustomDataActionType
  data: unknown
}
