import { SiteType } from '@pubstudio/shared/type-api-platform-site'
import { ISiteMetadata } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('List Sites', () => {
  const testEndpoint = (id: string) => `/api/sites_metadata/${id}`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
  })

  beforeEach(async () => {
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
    siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
  })

  describe('when request is valid and requestor is Admin', () => {
    it('returns 200 status code and sites metadata for enabled site', async () => {
      const execEnv = testConfig.get('execEnv')

      const response = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)
      const body: ISiteMetadata = response.body

      expect(body.id).toEqual(siteId)
      expect(body.owner_email).toEqual('user1@samatech.tw')
      expect(body.owner_id).toEqual('903b3c28-deaa-45dc-a43f-511fe965d34e')
      expect(body.location).toEqual(`site-api/db/sites/site_${siteId}.db`)
      expect(body.disabled).toEqual(false)
      expect(body.site_type).toEqual(SiteType.Paid2)
      expect(body.custom_domains).toEqual([
        { domain: 'test3.localhost', verified: false },
        { domain: `user1-site3-subdomain.${execEnv}.pubstud.io`, verified: false },
      ])
    })
  })

  describe('when request is not valid', () => {
    it('when requester is owner', () => {
      const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
      const ownerAuth = ownerAuthHeader(ownerId)

      return api.get(testEndpoint(siteId)).set('Authorization', ownerAuth).expect({
        code: 'None',
        message: 'Forbidden',
        status: 403,
      })
    })

    it('when bearer token is malformed', () => {
      return api
        .get(testEndpoint(siteId))
        .set('Authorization', 'Bearer bad-auth')
        .expect({
          code: 'InvalidAuth',
          message: 'Unauthorized',
          status: 401,
        })
    })

    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('4009627b-2b7c-4f11-9860-015fed54592f')

      return api.get(testEndpoint(siteId)).set('Authorization', ownerAuth).expect({
        code: 'None',
        message: 'Forbidden',
        status: 403,
      })
    })
  })
})
