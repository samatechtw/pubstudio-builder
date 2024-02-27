import { SiteType } from '@pubstudio/shared/type-api-platform-site'

export function getCapacity(siteType: SiteType): number {
  switch (siteType) {
    case SiteType.Free:
      return 1
    case SiteType.Paid1:
      return 5
    case SiteType.Paid2:
      return 20
    case SiteType.Paid3:
      return 50
    default:
      return 0
  }
}
