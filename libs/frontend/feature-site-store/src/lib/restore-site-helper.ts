import { createSite } from '@pubstudio/frontend/util-build'
import { unstoreSite } from '@pubstudio/frontend/util-site-deserialize'
import { validateSite } from '@pubstudio/frontend/util-site-store'
import { ISiteRestore, IStoredSite } from '@pubstudio/shared/type-site'
import { restoreSiteError } from './restore-site-error'

export const restoreSiteHelper = (data: IStoredSite): ISiteRestore => {
  let site = unstoreSite(data)
  if (!site) {
    site = createSite('scratch')
  }
  if (!site) {
    return restoreSiteError('errors.site_restore_fail')
  }
  const validateError = validateSite(site)
  if (validateError) {
    return restoreSiteError(validateError)
  }
  return { site, error: undefined }
}
