import { pushCommand } from '@pubstudio/frontend/data-access-command'
import { builderConfig } from '@pubstudio/frontend/util-config'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISiteMigrationData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const migrateSite = (site: ISite): boolean => {
  if (site.version !== builderConfig.siteFormatVersion) {
    const data: ISiteMigrationData = {
      oldVersion: site.version,
      newVersion: builderConfig.siteFormatVersion,
    }
    pushCommand(site, CommandType.MigrateSite, data)
    return true
  }
  return false
}
