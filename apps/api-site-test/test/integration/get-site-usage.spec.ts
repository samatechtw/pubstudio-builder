import {
  ICreateSiteApiResponse,
  IGetSiteApiResponse,
  IGetSiteUsageApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import { commonRegex } from '@pubstudio/shared/util-parse'
import supertest from 'supertest'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockCreateSitePayload } from '../mocks/mock-create-site-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { mockUpdateSitePayload } from '../mocks/update-create-site-payload'
import { testConfig } from '../test.config'

describe('Get Site Usage', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/usage`
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

  describe('Admin Requestor Site Usage Tracking', () => {
    it('tracks successful site request for site usage', async () => {
      // Initial site usage request
      const res1 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetSiteUsageApiResponse = res1.body
      expect(body1.request_count).toEqual(1)
      expect(body1.request_error_count).toEqual(0)
      expect(body1.site_size).toEqual(body1.total_bandwidth)
      expect(body1.last_updated).toMatch(new RegExp(commonRegex.date))

      // Successful site request
      await api.get(`/api/sites/${siteId}`).set('Authorization', adminAuth).expect(200)

      // Verify updated site usage after successful request
      const res2 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetSiteUsageApiResponse = res2.body
      expect(body2.request_count).toEqual(2)
      expect(body2.request_error_count).toEqual(0)
      expect(body2.total_bandwidth).toEqual(body2.site_size * 2)
    })

    it('tracks failed site request for site usage', async () => {
      // Initial site usage request
      const res1 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetSiteUsageApiResponse = res1.body
      expect(body1.request_count).toEqual(1)
      expect(body1.request_error_count).toEqual(0)
      expect(body1.site_size).toEqual(body1.total_bandwidth)

      // Failed site request
      await api.get(`/api/sites/${siteId}`).set('Authorization', 'invalid').expect(403)

      // Verify updated site usage after failed request
      const res2 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetSiteUsageApiResponse = res2.body

      expect(body2.request_count).toEqual(1)
      expect(body2.request_error_count).toEqual(1)
      expect(body2.site_size).toEqual(body2.total_bandwidth)
    })

    it('tracks site usage after successful site creation', async () => {
      // Initial site usage request
      const res1 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetSiteUsageApiResponse = res1.body
      expect(body1.request_count).toEqual(1)
      expect(body1.request_error_count).toEqual(0)
      expect(body1.site_size).toEqual(body1.total_bandwidth)

      // Create a site
      const res2 = await api
        .post(`/api/sites`)
        .set('Authorization', adminAuth)
        .send(mockCreateSitePayload())
        .expect(201)
      const body: ICreateSiteApiResponse = res2.body

      // Verify site usage after successful creation
      const res3 = await api
        .get(testEndpoint(body.id))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetSiteUsageApiResponse = res3.body
      expect(body2.site_size).toEqual(body2.total_bandwidth)
      expect(body2.request_count).toEqual(1)
      expect(body2.request_error_count).toEqual(0)
    })

    it('tracks site usage after successful site update', async () => {
      // Initial site usage request
      const res1 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetSiteUsageApiResponse = res1.body
      expect(body1.request_count).toEqual(1)
      expect(body1.request_error_count).toEqual(0)
      expect(body1.site_size).toEqual(body1.total_bandwidth)

      // Update a site
      const res2 = await api
        .patch(`/api/sites/${siteId}`)
        .set('Authorization', adminAuth)
        .send(mockUpdateSitePayload())
        .expect(200)
      const body: IGetSiteApiResponse = res2.body
      const siteSize = body.context.length + body.defaults.length + body.pages.length

      // Verify site usage after successful update
      const res3 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetSiteUsageApiResponse = res3.body
      expect(body2.site_size).toEqual(siteSize)
      expect(body2.request_count).toEqual(2)
      expect(body2.request_error_count).toEqual(0)
      expect(body2.total_bandwidth).toEqual(siteSize * 2)
    })
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
