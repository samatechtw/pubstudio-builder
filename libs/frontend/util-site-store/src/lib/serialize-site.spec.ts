import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISite } from '@pubstudio/shared/type-site'
import { mockSerializedSite } from '@pubstudio/web/util-test-mock'
import { stringifySite } from './serialize-site'
import { validateSite } from './validate-site'

jest.mock('@pubstudio/frontend/util-config', () => ({ SITE_FORMAT_VERSION: '0.1' }))

describe('Serialize site', () => {
  let site: ISite

  beforeEach(() => {
    const siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
  })

  it('serializes and restores a site to its original state', async () => {
    const savedSite = stringifySite(site, true)
    const deserializedSite = deserializeSite(savedSite) as ISite
    expect(site).toBeDefined()

    const error = validateSite(deserializedSite)
    expect(error).toBeUndefined()
    expect(deserializedSite).toEqual(site)
  })
})
