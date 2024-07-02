import { builderConfig } from '@pubstudio/frontend/util-config'
import { ISite } from '@pubstudio/shared/type-site'

export const validateSite = (site: ISite): string | undefined => {
  if (site.version !== builderConfig.siteFormatVersion) {
    return 'errors.site_format'
  }
  return undefined
}
