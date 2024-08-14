import { PSApi } from '@pubstudio/frontend/util-api'
import {
  IGetUserApiResponse,
  IUpdateUserApiRequest,
  IUpdateUserApiResponse,
} from '@pubstudio/shared/type-api-platform-user'

export interface IApiUser {
  getUser: (userId: string) => Promise<IGetUserApiResponse>
  updateUser: (
    userId: string,
    data: IUpdateUserApiRequest,
  ) => Promise<IUpdateUserApiResponse>
}

export const useUserApi = (api: PSApi): IApiUser => {
  const getUser = async (userId: string): Promise<IGetUserApiResponse> => {
    const { data } = await api.authRequest({
      url: `users/${userId}`,
      method: 'GET',
    })
    return data as IGetUserApiResponse
  }

  const updateUser = async (
    userId: string,
    payload: IUpdateUserApiRequest,
  ): Promise<IUpdateUserApiResponse> => {
    const { data } = await api.authRequest({
      url: `users/${userId}`,
      method: 'PATCH',
      data: payload,
    })
    return data as IUpdateUserApiResponse
  }

  return {
    getUser,
    updateUser,
  }
}
