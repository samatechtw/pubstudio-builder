import { IGetSiteDomainsApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Get Site Domains', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/domains`
  let api: supertest.SuperTest<supertest.Test>
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    await resetService.reset()
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
  })

  it('gets site domains when requester is admin', async () => {
    const execEnv = testConfig.get('execEnv')

    const response = await api
      .get(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .expect(200)
    const body: IGetSiteDomainsApiResponse = response.body

    expect(body.domains).toEqual([
      'www.myblog.org',
      'user1-site3.localhost',
      `user1-site2-subdomain.${execEnv}.pubstud.io`,
    ])
  })

  describe('when request is not valid', () => {
    it('when user is other owner', () => {
      const ownerAuth = ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10')

      return api.get(testEndpoint(siteId)).set('Authorization', ownerAuth).expect(403, {
        code: 'None',
        message: 'Forbidden',
        status: 403,
      })
    })

    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('ecee2f88-024b-467b-81ec-bf92b06c86e1')

      return api.get(testEndpoint(siteId)).set('Authorization', ownerAuth).expect(403, {
        code: 'None',
        message: 'Forbidden',
        status: 403,
      })
    })

    it('when requester is anonymous', () => {
      return api.get(testEndpoint(siteId)).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })
  })
})
