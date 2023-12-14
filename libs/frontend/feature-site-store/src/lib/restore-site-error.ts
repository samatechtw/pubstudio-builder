import { createSite } from '@pubstudio/frontend/util-build'
import { ISiteRestore } from '@pubstudio/shared/type-site'

export const restoreSiteError = (error: string): ISiteRestore => {
  return {
    site: createSite('scratch'),
    error,
  }
}
