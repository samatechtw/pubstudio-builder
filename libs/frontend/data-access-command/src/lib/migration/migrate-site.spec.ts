import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { CommandType } from '@pubstudio/shared/type-command'
import { ISiteMigrationData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { pushCommand, redoCommand, undoLastCommand } from '../command'
import { OLD_BEHAVIORS } from './test-old-behaviors'

describe('Migrate Site', () => {
  let siteString: string
  let site: ISite

  beforeEach(() => {
    siteString = OLD_BEHAVIORS
    site = deserializeSite(siteString) as ISite
  })

  it('should migrate site, undo, and redo', () => {
    // No behaviors in site (only globals)
    expect(site.context.behaviors).toEqual({})

    // Migrate to V2
    const data: ISiteMigrationData = {
      oldVersion: site.version,
      newVersion: '2',
    }
    pushCommand(site, CommandType.MigrateSite, data)
    // Assert behaviors are copied into the site
    expect(site.context.behaviors['global-b-toggleHidden']).toBeDefined()
    expect(site.context.behaviors['global-b-contactformclearerror']).toBeDefined()
    expect(site.context.behaviors['global-b-contactform']).toBeDefined()
    expect(site.version).toEqual('2')

    undoLastCommand(site)

    // Behaviors are removed
    expect(site.context.behaviors).toEqual({})
    expect(site.version).toEqual('1')

    // Simulate a redo, and make sure the behaviors are not added again
    redoCommand(site)
    expect(Object.keys(site.context.behaviors)).toHaveLength(3)
    expect(site.version).toEqual('2')
  })
})
