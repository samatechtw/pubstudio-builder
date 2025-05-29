import {
  ICreateSiteApiResponse,
  IGetPublicSiteUsageApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { commonRegex } from '@pubstudio/shared/util-parse'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockCreateSitePayload } from '../mocks/mock-create-site-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { mockUpdateSitePayload } from '../mocks/update-create-site-payload'
import { testConfig } from '../test.config'

describe('Get Site Usage', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/public_usage`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let publishedSiteId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    await resetService.reset()
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    publishedSiteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
  })

  describe('Admin Requestor Site Usage Tracking', () => {
    it('tracks successful site request for site usage', async () => {
      // Initial site usage request
      const res1 = await api
        .get(testEndpoint(publishedSiteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetPublicSiteUsageApiResponse = res1.body
      expect(body1.total_site_view_count).toEqual(0)
      expect(body1.last_updated).toMatch(new RegExp(commonRegex.date))

      // Successful site request
      await api.get('/api/sites/current').set('Host', 'test3.localhost').expect(200)

      // Verify updated site usage after successful request
      const res2 = await api
        .get(testEndpoint(publishedSiteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetPublicSiteUsageApiResponse = res2.body
      expect(body2.total_site_view_count).toEqual(1)
    })

    it('tracks site usage after successful site creation', async () => {
      // Create a site
      const res1 = await api
        .post(`/api/sites`)
        .set('Authorization', adminAuth)
        .send(mockCreateSitePayload())
        .expect(201)
      const body: ICreateSiteApiResponse = res1.body

      // Verify site usage after successful creation
      const res2 = await api
        .get(testEndpoint(body.id))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetPublicSiteUsageApiResponse = res2.body
      expect(body2.total_site_view_count).toEqual(0)
    })

    it('tracks site usage after successful site update', async () => {
      // Initial site usage request
      const res1 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetPublicSiteUsageApiResponse = res1.body
      expect(body1.total_site_view_count).toEqual(0)

      // Update a site
      await api
        .patch(`/api/sites/${siteId}`)
        .set('Authorization', adminAuth)
        .send(mockUpdateSitePayload())
        .expect(200)

      // Verify site view count not incremented after successful update
      const res3 = await api
        .get(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetPublicSiteUsageApiResponse = res3.body
      expect(body2.total_site_view_count).toEqual(0)
    })

    it('tracks page views after recording', async () => {
      // Initial site usage request
      const res1 = await api
        .get(testEndpoint(publishedSiteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body1: IGetPublicSiteUsageApiResponse = res1.body
      expect(body1.total_page_views).toEqual({})

      // Record page views
      await api
        .post(`/api/sites/${publishedSiteId}/usage/actions/page_view`)
        .set('Host', 'test3.localhost')
        .send({ route: '/home' })
        .expect(200)
      await api
        .post(`/api/sites/${publishedSiteId}/usage/actions/page_view`)
        .set('Host', 'test3.localhost')
        .send({ route: '/home' })
        .expect(200)

      // Verify page view count updated
      const res2 = await api
        .get(testEndpoint(publishedSiteId))
        .set('Authorization', adminAuth)
        .expect(200)

      const body2: IGetPublicSiteUsageApiResponse = res2.body
      expect(body2.total_page_views).toEqual({ '/home': 2 })
    })
  })

  it('when page does not exist', async () => {
    await api
      .post(`/api/sites/${publishedSiteId}/usage/actions/page_view`)
      .set('Host', 'test3.localhost')
      .send({ route: '/home2' })
      .expect(400, {
        status: 400,
        code: 'InvalidRoute',
        message: 'Failed to validate request',
      })
  })

  it('when host does not match site id', async () => {
    await api
      .post(`/api/sites/${siteId}/usage/actions/page_view`)
      .set('Host', 'test3.localhost')
      .send({ route: '/home' })
      .expect(400, {
        status: 400,
        code: 'InvalidFormData',
        message: 'Failed to validate request',
      })
  })

  it('when user is other owner', async () => {
    const ownerAuth = ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10')
    const res2 = await api
      .get(testEndpoint(publishedSiteId))
      .set('Authorization', ownerAuth)
      .expect(200)

    const body2: IGetPublicSiteUsageApiResponse = res2.body
    expect(body2.total_site_view_count).toEqual(0)
  })

  it('when user is not authorized', async () => {
    const ownerAuth = ownerAuthHeader('ecee2f88-024b-467b-81ec-bf92b06c86e1')

    const res2 = await api
      .get(testEndpoint(publishedSiteId))
      .set('Authorization', ownerAuth)
      .expect(200)

    const body2: IGetPublicSiteUsageApiResponse = res2.body
    expect(body2.total_site_view_count).toEqual(0)
  })

  it('when requester is anonymous', async () => {
    const res2 = await api.get(testEndpoint(publishedSiteId)).expect(200)

    const body2: IGetPublicSiteUsageApiResponse = res2.body
    expect(body2.total_site_view_count).toEqual(0)
  })
})
