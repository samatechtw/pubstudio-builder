import { store } from '@pubstudio/frontend/data-access-web-store'
import { PSApi } from '@pubstudio/frontend/util-api'
import { SITE_API_URL } from '@pubstudio/frontend/util-config'

export const API_URL = `${SITE_API_URL}/api/`

export const rootApi = new PSApi({
  baseUrl: API_URL,
  userToken: store.auth.token,
})
