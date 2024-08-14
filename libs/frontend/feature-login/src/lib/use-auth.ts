import { IApiAuth, useAuthApi } from '@pubstudio/frontend/data-access-api'
import {
  ApiInjectionKey,
  StoreInjectionKey,
} from '@pubstudio/frontend/data-access-injection'
import { IFrontendStore } from '@pubstudio/frontend/data-access-state'
import { PSApi } from '@pubstudio/frontend/util-api'
import { ILoginUserApiRequest } from '@pubstudio/shared/type-api-platform-auth'
import {
  IRegisterUserApiRequest,
  IRegisterUserApiResponse,
} from '@pubstudio/shared/type-api-platform-user'
import { useI18n } from 'petite-vue-i18n'
import { computed, ComputedRef, inject, ref, Ref } from 'vue'
import { useUser } from './use-user'

export interface IAuthFeature {
  api: IApiAuth
  registerUser: (user: IRegisterUserApiRequest) => Promise<IRegisterUserApiResponse>
  loginUser: (user: ILoginUserApiRequest) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (jwt: string, password: string) => Promise<void>
  logoutUser: () => void
  validatePassword: (password: string) => boolean
  loggedIn: ComputedRef<boolean>
  authError: Ref<string>
}

export const useAuth = (): IAuthFeature => {
  const rootApi = inject(ApiInjectionKey) as PSApi
  const store = inject(StoreInjectionKey) as IFrontendStore
  const api = useAuthApi(rootApi)
  const { getUser } = useUser()
  const { t } = useI18n()

  const authError = ref()

  const registerUser = async (
    user: IRegisterUserApiRequest,
  ): Promise<IRegisterUserApiResponse> => {
    const response = await api.registerUser(user)
    return response
  }

  // Log in a user via API (same method for User and Admin)
  const loginUser = async (user: ILoginUserApiRequest): Promise<void> => {
    const auth = await api.loginUser(user)
    store.auth.logIn(auth.auth_token)
    await getUser()
  }

  const resetPassword = async (email: string): Promise<void> => {
    await api.resetPassword(email)
  }

  const updatePassword = async (jwt: string, password: string): Promise<void> => {
    await api.updatePassword(jwt, password)
  }

  const logoutUser = () => {
    store.auth.logOut()
  }

  const loggedIn = computed(() => {
    return store.auth.loggedIn.value
  })

  const validatePassword = (password: string): boolean => {
    if (password.length < 8 || password.length > 50) {
      authError.value = t('errors.password_length')
      return false
    }
    return true
  }

  return {
    api,
    registerUser,
    loginUser,
    resetPassword,
    updatePassword,
    logoutUser,
    validatePassword,
    loggedIn,
    authError,
  }
}
