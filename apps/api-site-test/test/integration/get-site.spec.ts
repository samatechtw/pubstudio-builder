import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import {
  adminAuthHeader,
  expiredAdminToken,
  expiredUser1Token,
  ownerAuthHeader,
} from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { mockUpdateSitePayload } from '../mocks/update-create-site-payload'
import { testConfig } from '../test.config'

describe('Get Site', () => {
  const testEndpoint = '/api/sites'
  let api: supertest.SuperTest<supertest.Test>
  let resetService: SiteApiResetService
  let adminAuth: string
  let ownerAuth: string
  let siteId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')

    await resetService.reset()
  })

  describe('when requestor is Admin', () => {
    it('returns all site data when not published', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .expect(200)
      const body: IGetSiteApiResponse = response.body

      expect(body.id).toEqual(1)
      expect(body.name).toEqual('Test Site 2')
      expect(body.published).toEqual(false)
      expect(body.version).toEqual('0.1')
      expect(body.context).toBeDefined()
      expect(body.defaults).toBeDefined()
      expect(body.editor).toBeDefined()
      expect(body.history).toBeDefined()
      expect(body.pages).toBeDefined()
    })

    it('returns 401 when admin token has expired', async () => {
      await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', expiredAdminToken)
        .expect(401, {
          code: 'InvalidAuth',
          message: 'Unauthorized',
          status: 401,
        })
    })
  })

  describe('when requestor is Owner', () => {
    it('returns all site data when not published', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const body: IGetSiteApiResponse = response.body

      expect(body.id).toEqual(1)
      expect(body.name).toEqual('Test Site 2')
      expect(body.published).toEqual(false)
      expect(body.version).toEqual('0.1')
      expect(body.context).toBeDefined()
      expect(body.defaults).toBeDefined()
      expect(body.editor).toBeDefined()
      expect(body.history).toBeDefined()
      expect(body.pages).toBeDefined()
    })

    it('returns 401 when owner token has expired', async () => {
      await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', expiredUser1Token)
        .expect(401, {
          code: 'InvalidAuth',
          message: 'Unauthorized',
          status: 401,
        })
    })

    it('returns 403 error when not published and owner_id does not match', () => {
      const otherOwnerAuth = ownerAuthHeader('3ba201ff-a8d8-42bb-84ef-8470e6d97f78')
      return api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', otherOwnerAuth)
        .expect(403)
    })
  })

  describe('when requester is Anonymous', () => {
    it('returns 200 status when site is already published', async () => {
      // This helps verify that the fixtures are working as expected
      const publishedSiteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'

      const response = await api.get(`${testEndpoint}/${publishedSiteId}`).expect(200)
      const body: IGetSiteApiResponse = response.body

      expect(body.id).toEqual(1)
      expect(body.name).toEqual('Test Site 3')
      expect(body.published).toEqual(null)
      expect(body.pages).toBeDefined()
      expect(body.history).toEqual(null)
      expect(body.editor).toEqual(null)
    })

    it('returns 200 status after new site version is published', async () => {
      // Create a published version for the site
      const publishVersion = 1
      await api
        .post(`${testEndpoint}/${siteId}/actions/publish`)
        .send({ version_id: publishVersion })
        .set('Authorization', ownerAuth)

      const response = await api.get(`${testEndpoint}/${siteId}`).expect(200)
      const body: IGetSiteApiResponse = response.body

      expect(body.id).toEqual(publishVersion)
      expect(body.name).toEqual('Test Site 2')
      expect(body.published).toEqual(null)
      expect(body.pages).toBeDefined()
      expect(body.history).toEqual(null)
      expect(body.editor).toEqual(null)
    })

    it('returns 403 error if no published version exists', async () => {
      await api.get(`${testEndpoint}/${siteId}`).expect(403)
    })

    it('returns 509 error when bandwidth usage exceeds allowance', async () => {
      const payload = mockUpdateSitePayload()
      // Generate a large JSON string by repeating '{"some":"stringified_json"}' 80 times
      payload.context = '{"some":"stringified_json"}'.repeat(80)

      // Perform the update request to the API
      await api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      return api.get(`${testEndpoint}/${siteId}`).expect(509, {
        code: 'None',
        message: 'Bandwidth exceeded',
        status: 509,
      })
    })
  })
})
