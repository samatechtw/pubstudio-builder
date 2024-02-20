import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import {
  adminAuthHeader,
  expiredAdminToken,
  expiredUser1Token,
  ownerAuthHeader,
} from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Get Site', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
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

    it('returns site data if current update_key does not match the saved content_updated_at', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .query({ update_key: 123456789 })
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

    it('returns empty site if current update_key match the saved content_updated_at', async () => {
      const prevResponse = await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const prevBody: IGetSiteApiResponse = prevResponse.body

      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .query({ update_key: prevBody.content_updated_at })
        .set('Authorization', adminAuth)
        .expect(204)

      expect(response.body).toEqual({})
    })

    it('returns 400 when update_key is invalid', async () => {
      await api
        .get(`${testEndpoint}/${siteId}`)
        .query({ update_key: '2023-11-07T08:25:58.131123' })
        .set('Authorization', adminAuth)
        .expect(400)
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
    it('returns 403 error', async () => {
      await api.get(`${testEndpoint}/${siteId}`).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })
  })
})
