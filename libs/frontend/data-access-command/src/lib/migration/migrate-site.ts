import { ISite } from '@pubstudio/shared/type-site'
import { migrateV1ToV2 } from './migrate-v1-v2'
import { migrateV2ToV3 } from './migrate-v2-v3'

// Migrations mutate the site directly instead of pushing commands: they run once when a
// site loads, and the caller clears history afterward because stored commands predate
// the new format. See docs/site-data-format.md
const migrateForward = (site: ISite, fromVersion: string): string | undefined => {
  // Original version was 0.1, but we switched to integer versions
  if (fromVersion === '1' || fromVersion === '0.1') {
    migrateV1ToV2(site)
    return '2'
  }
  if (fromVersion === '2') {
    migrateV2ToV3(site)
    return '3'
  }
}

export const migrateSiteVersion = (site: ISite, newVersion: string) => {
  let currentVersion: string | undefined = site.version
  while (currentVersion !== newVersion) {
    currentVersion = migrateForward(site, currentVersion)
    if (!currentVersion) {
      console.error('Failed to complete migration, site may be broken')
      return
    }
  }
}
