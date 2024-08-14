import { parseApiError, toApiError } from '@pubstudio/frontend/util-api'
import { ILoginUserApiRequest } from '@pubstudio/shared/type-api-platform-auth'
import { useI18n } from 'petite-vue-i18n'
import { ref, Ref } from 'vue'
import { useAuth } from '../lib/use-auth'

export interface IUseLoginFeature {
  payload: Ref<ILoginUserApiRequest>
  error: Ref<string | undefined>
  loading: Ref<boolean>
  validate: () => boolean
  platformLogin: () => Promise<boolean>
}
export const usePlatformLogin = (): IUseLoginFeature => {
  const i18n = useI18n()
  const { t } = i18n
  const { loginUser } = useAuth()

  const payload = ref<ILoginUserApiRequest>({
    email: '',
    password: '',
  })
  const error = ref<string>('')
  const loading = ref(false)

  const validate = (): boolean => {
    const password = payload.value.password
    if (password.length < 8 || password.length > 50) {
      error.value = t('errors.password_length')
      return false
    }
    return true
  }

  const platformLogin = async (): Promise<boolean> => {
    if (!validate()) {
      return false
    }
    loading.value = true
    error.value = ''
    try {
      await loginUser(payload.value)
      loading.value = false
      return true
    } catch (e) {
      console.log(e)
      error.value = parseApiError(i18n, toApiError(e))
      loading.value = false
      return false
    }
  }

  return {
    payload,
    error,
    loading,
    validate,
    platformLogin,
  }
}
