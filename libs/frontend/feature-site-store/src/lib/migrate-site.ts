import { clearAll, migrateSiteVersion } from '@pubstudio/frontend/data-access-command'
import { store } from '@pubstudio/frontend/data-access-web-store'
import { builderConfig } from '@pubstudio/frontend/util-config'
import { ISite } from '@pubstudio/shared/type-site'

// Returns true when the migration can be persisted. A historical version is read-only,
// so it migrates in memory to render correctly, but the stored site is left alone.
export const migrateSite = (site: ISite): boolean => {
  const newVersion = builderConfig.siteFormatVersion
  if (site.version === newVersion) {
    return false
  }
  migrateSiteVersion(site, newVersion)
  // Stored commands were recorded against the old format, so undoing across the
  // migration would corrupt the site. `clearAll` also saves the migrated site.
  clearAll(site)
  return store.version.editingEnabled.value
}
