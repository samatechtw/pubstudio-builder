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
    it('updates site, gets current site, creates a draft, updates it, and publishes', async () => {
      const execEnv = testConfig.get('execEnv')
      const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
      const newData1 = '{"test":"SOME TEST DATA"}'
      const newData2 = '{"test":"SOME TEST DATA 2"}'

      // Update the live site
      await api
        .patch(`/api/sites/${siteId}`)
        .set('Authorization', adminAuth)
        .send({ context: newData1 })
        .expect(200)

      // Make sure live site is published
      await api
        .post(`/api/sites/${siteId}/actions/publish`)
        .send({ publish: true })
        .set('Authorization', adminAuth)
        .expect(204)

      // Get current site
      const r1 = await api
        .get(testEndpoint)
        .set('Host', `user1-site3-subdomain.${execEnv}.pubstud.io`)
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetSiteApiResponse = r1.body
      expect(body1.context).toEqual(JSON.stringify(newData1))

      // Create a draft
      await api
        .post(`/api/sites/${siteId}/actions/create_draft`)
        .set('Authorization', adminAuth)
        .expect(200)

      // Update the draft
      await api
        .patch(`/api/sites/${siteId}`)
        .send({ context: newData2 })
        .set('Authorization', adminAuth)
        .expect(200)

      // Verify current site is not changed
      const r2 = await api
        .get(testEndpoint)
        .set('Host', `user1-site3-subdomain.${execEnv}.pubstud.io`)
        .set('Authorization', adminAuth)
        .expect(200)
      const body2: IGetSiteApiResponse = r2.body
      expect(body2.context).toEqual(JSON.stringify(newData1))

      // Publish the draft
      await api
        .post(`/api/sites/${siteId}/actions/publish`)
        .send({ publish: true })
        .set('Authorization', adminAuth)
        .expect(204)

      // Verify current site is updated
      const r3 = await api
        .get(testEndpoint)
        .set('Host', `user1-site3-subdomain.${execEnv}.pubstud.io`)
        .set('Authorization', adminAuth)
        .expect(200)
      const body3: IGetSiteApiResponse = r3.body
      expect(body3.context).toEqual(JSON.stringify(newData2))
    })

    it('returns current site and filters pages with public: false', async () => {
      const execEnv = testConfig.get('execEnv')
      const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
      const pagesBefore = JSON.stringify({
        '/home': {
          public: true,
        },
        '/page1': {
          abc: 'test',
          public: false,
        },
        '/page2': {
          abc: 'test',
          public: true,
        },
      })

      const pagesAfter = JSON.stringify({
        '/home': {
          public: true,
        },
        '/page2': {
          abc: 'test',
          public: true,
        },
      })

      // Update site pages
      await api
        .patch(`/api/sites/${siteId}`)
        .set('Authorization', adminAuth)
        .send({ pages: pagesBefore })
        .expect(200)

      // Verify pages filter out with `public: false`
      const response = await api
        .get(testEndpoint)
        .set('Host', `user1-site3-subdomain.${execEnv}.pubstud.io`)
        .set('Authorization', adminAuth)
        .expect(200)

      const body: IGetSiteApiResponse = response.body
      expect(body.name).toEqual('Test Site 3')
      expect(body.pages).toEqual(JSON.stringify(pagesAfter))
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

    it('returns error requester is admin and site is unpublished', () => {
      return api
        .get(testEndpoint)
        .set('Host', 'www.myblog.org')
        .set('Authorization', adminAuth)
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
      const siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
      // Generate a large JSON string by repeating '{"some":"stringified_json"}' 80 times
      payload.context = '{"some":"stringified_json"}'.repeat(80)

      // Publish the draft
      await api
        .post(`/api/sites/${siteId}/actions/publish`)
        .send({ publish: true })
        .set('Authorization', adminAuth)
        .expect(204)

      // Perform the update request to the API
      await api
        .patch(`/api/sites/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      return api.get(testEndpoint).set('Host', 'www.myblog.org').expect(509, {
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
