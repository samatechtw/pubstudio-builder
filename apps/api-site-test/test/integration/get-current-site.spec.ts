import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { mockUpdateSitePayload } from '../mocks/update-create-site-payload'
import { testConfig } from '../test.config'

describe('Get Current Site', () => {
  const testEndpoint = '/api/sites/current'
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    await resetService.reset()
  })

  describe('Request with Valid Hostname', () => {
    it('returns current when requester is admin site for subdomain', async () => {
      const execEnv = testConfig.get('execEnv')
      const response = await api
        .get(testEndpoint)
        .set('Host', `my-subdomain.${execEnv}.pubstud.io`)
        .set('Authorization', adminAuth)
        .expect(200)

      const body: IGetSiteApiResponse = response.body
      expect(body.name).toEqual('Test Site 1')
      expect(body.version).toEqual('0.1')
      expect(body.context).toBeDefined()
      expect(body.defaults).toBeDefined()
      expect(body.pages).toBeDefined()
    })

    it('returns current site when requester is admin for custom domain', async () => {
      const response = await api
        .get(testEndpoint)
        .set('Host', 'www.myblog.org')
        .set('Authorization', adminAuth)
        .expect(200)

      const body: IGetSiteApiResponse = response.body
      expect(body.name).toEqual('Test Site 2')
      expect(body.version).toEqual('0.1')
      expect(body.context).toBeDefined()
      expect(body.defaults).toBeDefined()
      expect(body.pages).toBeDefined()
    })

    it('returns current site when requester is owner for custom domain', async () => {
      const ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')
      const response = await api
        .get(testEndpoint)
        .set('Host', 'www.myblog.org')
        .set('Authorization', ownerAuth)
        .expect(200)

      const body: IGetSiteApiResponse = response.body
      expect(body.name).toEqual('Test Site 2')
      expect(body.version).toEqual('0.1')
      expect(body.context).toBeDefined()
      expect(body.defaults).toBeDefined()
      expect(body.pages).toBeDefined()
    })

    it('returns current site when requester is anonymous', async () => {
      const response = await api.get(testEndpoint).set('Host', 'test3.com').expect(200)

      const body: IGetSiteApiResponse = response.body
      expect(body.name).toEqual('Test Site 3')
      expect(body.version).toEqual('0.1')
      expect(body.context).toBeDefined()
      expect(body.defaults).toBeDefined()
      expect(body.pages).toBeDefined()
    })

    it('returns error when requester is other owner and site is unpublished', () => {
      const ownerAuth = ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10')
      return api
        .get(testEndpoint)
        .set('Host', 'www.myblog.org')
        .set('Authorization', ownerAuth)
        .expect(400, {
          code: 'SiteUnpublished',
          message: 'Failed to validate request',
          status: 400,
        })
    })

    it('returns error when requester is anonymous and site is unpublished', () => {
      return api.get(testEndpoint).set('Host', 'www.myblog.org').expect(400, {
        code: 'SiteUnpublished',
        message: 'Failed to validate request',
        status: 400,
      })
    })

    it('returns 509 when bandwidth usage exceeds allowance', async () => {
      const payload = mockUpdateSitePayload()
      // Generate a large JSON string by repeating '{"some":"stringified_json"}' 80 times
      payload.context = '{"some":"stringified_json"}'.repeat(80)

      // Perform the update request to the API
      const siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
      await api
        .patch(`/api/sites/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      return api
        .get(testEndpoint)
        .set('Host', 'www.myblog.org')
        .set('Authorization', adminAuth)
        .expect(509, {
          code: 'None',
          message: 'Bandwidth exceeded',
          status: 509,
        })
    })
  })

  describe('Request with Invalid Hostname', () => {
    it('returns an error for an invalid hostname', async () => {
      await api.get(testEndpoint).expect(400, {
        code: 'None',
        message: 'Error fetching site ID by hostname',
        status: 400,
      })
    })
  })
})