import { SITE_FORMAT_VERSION } from '@pubstudio/frontend/util-config'
import { ISite } from '@pubstudio/shared/type-site'

export const validateSite = (site: ISite): string | undefined => {
  if (site.version !== SITE_FORMAT_VERSION) {
    return 'errors.site_format'
  }
  return undefined
}
