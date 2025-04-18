import { unstoreSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISiteRestore, IStoredSite } from '@pubstudio/shared/type-site'
import { createSite } from './create-site'

export const restoreSiteHelper = (data: IStoredSite): ISiteRestore => {
  let site = unstoreSite(data)
  if (!site) {
    site = createSite('scratch')
  }
  if (!site) {
    return restoreSiteError('errors.site_restore_fail')
  }
  return { site, error: undefined }
}

export const restoreSiteError = (error: string): ISiteRestore => {
  return {
    site: createSite('scratch'),
    error,
  }
}
