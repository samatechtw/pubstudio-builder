import { createSite } from '@pubstudio/frontend/util-build'
import { ISiteRestore } from '@pubstudio/shared/type-site-store'

export const restoreSiteError = (error: string): ISiteRestore => {
  return {
    site: createSite('scratch'),
    error,
  }
}
