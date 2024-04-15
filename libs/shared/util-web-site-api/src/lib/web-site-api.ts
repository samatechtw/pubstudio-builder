import { ref } from 'vue'
import { SiteApi } from './site-api'

export const rootSiteApi = new SiteApi({
  baseUrl: '',
  userToken: ref(null),
})
