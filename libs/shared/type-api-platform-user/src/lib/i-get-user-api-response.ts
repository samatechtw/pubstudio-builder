import { IUserViewModel } from './i-user.view-model'

export interface ILocalSiteRelationViewModel {
  id: string
  name: string
  published: boolean
  subdomain: string
}

export interface IGetUserApiResponse extends IUserViewModel {
  identity: ILocalSiteRelationViewModel
}
