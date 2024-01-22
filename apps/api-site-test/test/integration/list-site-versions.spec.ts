import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('List Site Versions', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let ownerId: string
  let siteId: string

  beforeAll(async () => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
  })

  beforeEach(async () => {
    ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'

    // publish more versions for test
    await api
      .post(`${testEndpoint}/${siteId}/actions/publish`)
      .send({ version_id: 1 })
      .set('Authorization', adminAuth)

    await api
      .post(`${testEndpoint}/${siteId}/actions/publish`)
      .send({ version_id: 2 })
      .set('Authorization', adminAuth)
  })

  describe('when request is valid', () => {
    describe('and requestor is Owner', () => {
      it('returns unauthorized user is Owner', async () => {
        const ownerAuth = ownerAuthHeader(ownerId)

        const response = await api
          .get(`${testEndpoint}/${siteId}/versions?from=2&to=3`)
          .set('Authorization', ownerAuth)
          .expect(200)

        const body: IGetSiteApiResponse[] = response.body

        expect(response.status).toBe(200)
        expect(body.length).toEqual(2)
        expect(body[0].id).toEqual(2)
        expect(body[1].id).toEqual(3)
      })
    })

    describe('when requestor is Admin', () => {
      it('returns 200 status code', async () => {
        const response = await api
          .get(`${testEndpoint}/${siteId}/versions?from=2&to=3`)
          .set('Authorization', adminAuth)

        const body: IGetSiteApiResponse[] = response.body

        expect(response.status).toBe(200)
        expect(body.length).toEqual(2)
        expect(body[0].id).toEqual(2)
        expect(body[1].id).toEqual(3)
      })

      it('returns 200 code with default from and to values', async () => {
        const response = await api
          .get(`${testEndpoint}/${siteId}/versions`)
          .set('Authorization', adminAuth)

        const body: IGetSiteApiResponse[] = response.body

        expect(response.status).toBe(200)
        expect(body.length).toEqual(3)
        expect(body[0].id).toEqual(1)
        expect(body[1].id).toEqual(2)
        expect(body[2].id).toEqual(3)
      })

      it('returns 200 code with default "to" value', async () => {
        const response = await api
          .get(`${testEndpoint}/${siteId}/versions?from=3`)
          .set('Authorization', adminAuth)

        const body: IGetSiteApiResponse[] = response.body

        expect(response.status).toBe(200)
        expect(body.length).toBe(1)
        expect(body[0].id).toEqual(3)
      })

      it('returns 200 code if from and to exceed data count', async () => {
        const response = await api
          .get(`${testEndpoint}/${siteId}/versions?from=10&to=20`)
          .set('Authorization', adminAuth)

        expect(response.status).toBe(200)
        expect(response.body).toEqual([])
      })
    })
  })

  describe('when request is not valid', () => {
    it('returns 400 code for invalid from or to value', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}/versions?from=abc&to=10`)
        .set('Authorization', adminAuth)

      expect(response.status).toBe(400)
    })

    it('returns 400 code if from or to value is less than 1', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}/versions?from=0&to=10`)
        .set('Authorization', adminAuth)

      expect(response.status).toBe(400)
    })

    it('returns 400 code if from is greater than to', () => {
      return api
        .get(`${testEndpoint}/${siteId}/versions?from=8&to=7`)
        .set('Authorization', adminAuth)
        .expect({
          code: 'InvalidFormData',
          message: 'From value must be less than or equal to To value',
          status: 400,
        })
    })

    it('returns 400 code for invalid query string parameter', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}/versions?from=1&to=10&invalidParam=abc`)
        .set('Authorization', adminAuth)

      expect(response.status).toBe(400)
    })

    it('returns 404 code when `siteId` does not exist', async () => {
      const invalidSiteId = '999'
      const response = await api
        .get(`${testEndpoint}/${invalidSiteId}/versions`)
        .set('Authorization', adminAuth)

      expect(response.status).toBe(404)
    })

    it('returns forbidden when owner_id does not match', () => {
      const ownerAuth = ownerAuthHeader('3ba201ff-a8d8-42bb-84ef-8470e6d97f78')

      return api
        .get(`${testEndpoint}/${siteId}/versions?from=2&to=3`)
        .set('Authorization', ownerAuth)
        .expect(403, {
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })

    it('returns unauthorized when user is Anonymous', () => {
      return api.get(`${testEndpoint}/${siteId}/versions`).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })
  })
})
