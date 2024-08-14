import { PSApi } from '@pubstudio/frontend/util-api'
import {
  ILoginUserApiRequest,
  ILoginUserApiResponse,
} from '@pubstudio/shared/type-api-platform-auth'
import {
  IRegisterUserApiRequest,
  IRegisterUserApiResponse,
} from '@pubstudio/shared/type-api-platform-user'

export interface IApiAuth {
  registerUser(user: IRegisterUserApiRequest): Promise<IRegisterUserApiResponse>
  loginUser: (user: ILoginUserApiRequest) => Promise<ILoginUserApiResponse>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (jwt: string, password: string) => Promise<void>
  confirmEmail: (code: string) => Promise<void>
  resendConfirmEmail: () => Promise<void>
}

export const useAuthApi = (api: PSApi): IApiAuth => {
  const registerUser = async (
    user: IRegisterUserApiRequest,
  ): Promise<IRegisterUserApiResponse> => {
    const { data } = await api.request({
      url: 'users/registrations',
      method: 'POST',
      data: user,
    })
    return data as unknown as IRegisterUserApiResponse
  }

  const loginUser = async (
    user: ILoginUserApiRequest,
  ): Promise<ILoginUserApiResponse> => {
    const { data } = await api.request({
      url: 'auth/logins',
      method: 'POST',
      data: user,
    })
    return data as unknown as ILoginUserApiResponse
  }

  const resetPassword = async (email: string): Promise<void> => {
    await api.request({
      url: 'auth/logins/reset-password',
      method: 'POST',
      data: { email },
    })
  }

  const updatePassword = async (jwt: string, password: string): Promise<void> => {
    await api.request({
      url: 'auth/logins/passwords',
      method: 'PATCH',
      data: { password },
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    })
  }

  const confirmEmail = async (code: string): Promise<void> => {
    await api.request({
      url: 'auth/confirm-email',
      method: 'POST',
      data: { code },
    })
  }

  const resendConfirmEmail = async (): Promise<void> => {
    await api.authRequest({
      url: 'auth/resend-confirm-email',
      method: 'POST',
    })
  }

  return {
    registerUser,
    loginUser,
    resetPassword,
    updatePassword,
    confirmEmail,
    resendConfirmEmail,
  }
}
