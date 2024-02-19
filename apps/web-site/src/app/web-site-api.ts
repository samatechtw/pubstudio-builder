import { ref } from 'vue'
import { SiteApi } from './api'

export const rootSiteApi = new SiteApi({
  baseUrl: '',
  userToken: ref(null),
})
