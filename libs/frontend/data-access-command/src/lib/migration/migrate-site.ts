import { ISiteMigrationData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { migrateV1ToV2, migrateV2ToV1 } from './migrate-v1-v2'

const migrateForward = (site: ISite, fromVersion: string): string | undefined => {
  if (fromVersion === '1') {
    migrateV1ToV2(site)
    return '2'
  }
}

export const applyMigrateSite = (site: ISite, data: ISiteMigrationData) => {
  const { oldVersion, newVersion } = data
  let currentVersion: string | undefined = oldVersion
  while (currentVersion !== newVersion) {
    currentVersion = migrateForward(site, currentVersion)
    if (!currentVersion) {
      console.error('Failed to complete migration, site may be broken')
      return
    }
  }
}

const rollBack = (site: ISite, fromVersion: string): string | undefined => {
  if (fromVersion === '2') {
    migrateV2ToV1(site)
    return '1'
  }
}

export const undoSetBehavior = (site: ISite, data: ISiteMigrationData) => {
  const { oldVersion, newVersion } = data
  let currentVersion: string | undefined = oldVersion
  while (currentVersion !== newVersion) {
    currentVersion = rollBack(site, currentVersion)
    if (!currentVersion) {
      console.error('Failed to complete migration, site may be broken')
      return
    }
  }
}
