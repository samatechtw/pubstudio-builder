import { IListSitesApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockCreateSitePayload } from '../mocks/mock-create-site-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('List Sites', () => {
  const testEndpoint = '/api/sites'
  let api: supertest.SuperTest<supertest.Test>
  let resetService: SiteApiResetService
  let adminAuth: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
  })

  beforeEach(async () => {
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
  })

  describe('when request is valid and requestor is Admin', () => {
    it('returns 200 status code and sites metadata', async () => {
      const response = await api
        .get(testEndpoint)
        .set('Authorization', adminAuth)
        .expect(200)
      const body: IListSitesApiResponse = response.body

      for (const site of body) {
        expect(site.id).toBeDefined()
        expect(site.location).toBeDefined()
      }
    })

    it('adds a created site to the list', async () => {
      const response = await api
        .get(testEndpoint)
        .set('Authorization', adminAuth)
        .expect(200)
      const body: IListSitesApiResponse = response.body
      const beforeCount = body.length

      const createPayload = mockCreateSitePayload()
      await api
        .post(testEndpoint)
        .send(createPayload)
        .set('Authorization', adminAuth)
        .expect(201)

      const response2 = await api
        .get(testEndpoint)
        .set('Authorization', adminAuth)
        .expect(200)
      const body2: IListSitesApiResponse = response2.body
      expect(beforeCount + 1).toEqual(body2.length)
    })
  })

  describe('when request is not valid', () => {
    it('when bearer token is malformed', () => {
      return api.get(testEndpoint).set('Authorization', 'Bearer bad-auth').expect({
        code: 'InvalidAuth',
        message: 'Unauthorized',
        status: 401,
      })
    })

    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('4009627b-2b7c-4f11-9860-015fed54592f')

      return api.get(testEndpoint).set('Authorization', ownerAuth).expect({
        code: 'None',
        message: 'Forbidden',
        status: 403,
      })
    })
  })
})
