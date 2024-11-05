import { CommandType } from '@pubstudio/shared/type-command'
import {
  ICommandGroupData,
  ISiteMigrationData,
} from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { getLastCommand } from '../command'
import { migrateV1ToV2, migrateV2ToV1 } from './migrate-v1-v2'

const migrateForward = (site: ISite, fromVersion: string): string | undefined => {
  // Original version was 0.1, but we switched to integer versions
  if (fromVersion === '1' || fromVersion === '0.1') {
    migrateV1ToV2(site)
    return '2'
  }
}

export const applyMigrateSite = (site: ISite, data: ISiteMigrationData) => {
  const { oldVersion, newVersion } = data
  // Hacky way to see if the migration commands have already been generated, which means this
  // is a "redo" operation. If so, we shouldn't generate duplicates
  const command = getLastCommand(site)
  const groupData = command?.data as ICommandGroupData | undefined
  if (command?.type === CommandType.MigrateSite && groupData?.commands?.length) {
    console.warn('Skipping migrate command generation')
    return
  }
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

export const undoMigrateSite = (site: ISite, data: ISiteMigrationData) => {
  const { oldVersion, newVersion } = data
  let currentVersion: string | undefined = newVersion
  while (currentVersion !== oldVersion) {
    currentVersion = rollBack(site, currentVersion)
    if (!currentVersion) {
      console.error(
        `Failed to complete migration, version=${site.version}, expected=${oldVersion}`,
      )
      return
    }
  }
}
