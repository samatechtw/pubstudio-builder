import { UserStatus } from './enum-user-status'
import { UserType } from './enum-user-type'

export interface IUserViewModel {
  id: string
  email: string
  user_type: UserType
  user_status: UserStatus
  email_confirmed: boolean
  created_at: Date
}
