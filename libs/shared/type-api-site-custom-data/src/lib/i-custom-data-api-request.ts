import { Action } from './enum-action'

export interface ICustomDataApiRequest {
  action: Action
  data: string
}
