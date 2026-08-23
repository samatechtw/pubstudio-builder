import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISite } from '@pubstudio/shared/type-site'
import { migrateSiteVersion } from './migrate-site'
import { OLD_BEHAVIORS } from './test-old-behaviors'

describe('Migrate Site', () => {
  let site: ISite

  beforeEach(() => {
    site = deserializeSite(OLD_BEHAVIORS) as ISite
  })

  it('copies builtin behaviors into a v1 site', () => {
    // No behaviors in site (only globals)
    expect(site.context.behaviors).toEqual({})

    migrateSiteVersion(site, '2')

    expect(site.context.behaviors['global-b-toggleHidden']).toBeDefined()
    expect(site.context.behaviors['global-b-contactformclearerror']).toBeDefined()
    expect(site.context.behaviors['global-b-contactform']).toBeDefined()
    expect(site.version).toEqual('2')
  })

  it('runs every step between the stored version and the target', () => {
    migrateSiteVersion(site, '3')

    expect(Object.keys(site.context.behaviors)).toHaveLength(3)
    expect(site.version).toEqual('3')
  })
})
