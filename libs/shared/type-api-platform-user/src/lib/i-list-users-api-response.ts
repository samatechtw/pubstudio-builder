import { IUserViewModel } from './i-user.view-model'

export interface IListUsersApiResponse {
  total: number
  results: IUserViewModel[]
}
