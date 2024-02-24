import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Delete Site', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string

  beforeAll(async () => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
  })

  it('deletes a site', async () => {
    // Delete site
    await api
      .delete(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .expect(200)

    // Make sure Site no longer exists
    await api
      .get(`${testEndpoint}/${siteId}/versions/latest`)
      .set('Authorization', adminAuth)
      .expect(404)
  })

  describe('when request is not valid', () => {
    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')

      return api
        .delete(`${testEndpoint}/${siteId}`)
        .set('Authorization', ownerAuth)
        .expect({
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })
  })
})
