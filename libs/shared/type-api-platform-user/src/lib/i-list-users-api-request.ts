import { UserStatus } from './enum-user-status'
import { UserType } from './enum-user-type'

export interface IListUsersApiRequest {
  readonly from?: number
  readonly to?: number
  type?: UserType
  status?: UserStatus
}
