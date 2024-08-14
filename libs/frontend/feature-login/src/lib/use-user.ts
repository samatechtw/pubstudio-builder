import { IApiUser, useUserApi } from '@pubstudio/frontend/data-access-api'
import {
  ApiInjectionKey,
  StoreInjectionKey,
} from '@pubstudio/frontend/data-access-injection'
import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import { PSApi } from '@pubstudio/frontend/util-api'
import { minidenticon } from '@pubstudio/frontend/util-identicon'
import {
  IUpdateUserApiRequest,
  IUpdateUserApiResponse,
} from '@pubstudio/shared/type-api-platform-user'
import { inject } from 'vue'

export interface IUserFeature {
  api: IApiUser
  getUser: () => Promise<void>
  updateUser: (data: IUpdateUserApiRequest) => Promise<IUpdateUserApiResponse>
}

export const useUser = (): IUserFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const store = inject(StoreInjectionKey) as IFrontendStore
  const api = useUserApi(rootApi)

  const updateUser = async (
    data: IUpdateUserApiRequest,
  ): Promise<IUpdateUserApiResponse> => {
    const response = await api.updateUser(store.auth.userId.value ?? '', data)
    return response
  }

  const getUser = async () => {
    const id = store.auth.userId?.value
    if (id) {
      try {
        const user = await api.getUser(id)

        store.user.updateUser({
          id: user.id,
          email: user.email,
          emailConfirmed: user.email_confirmed,
          userType: user.user_type,
          userStatus: user.user_status,
          createdAt: user.created_at.getTime(),
          identity: user.identity,
        })
        if (!store.user.identiconAvatar.value) {
          store.user.updateUser({ identiconAvatar: minidenticon(user.email) })
        }
      } catch (e) {
        // TODO -- more reliable way to check user auth/token status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((e as any).statusCode === 404) {
          store.auth.logOut()
        }
      }
    } else {
      console.error('User ID not found, login required')
    }
  }

  return {
    api,
    getUser,
    updateUser,
  }
}
