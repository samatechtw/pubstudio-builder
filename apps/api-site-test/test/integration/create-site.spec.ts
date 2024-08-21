import {
  ICreateSiteApiRequest,
  ICreateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockCreateSitePayload } from '../mocks/mock-create-site-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Create Site', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
  let adminAuth: string
  let resetService: SiteApiResetService
  let payload: ICreateSiteApiRequest

  beforeAll(async () => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    payload = mockCreateSitePayload()
    await resetService.reset()
  })

  it('returns 201 status code and message when requester is admin', async () => {
    const response = await api
      .post(testEndpoint)
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(201)
    const body: ICreateSiteApiResponse = response.body

    expect(body.id).toEqual('1d2ba801-21ff-4243-b015-261496e60e3a')
  })

  describe('when request is not valid', () => {
    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('ecee2f88-024b-467b-81ec-bf92b06c86e1')

      return api.post(testEndpoint).set('Authorization', ownerAuth).expect({
        code: 'None',
        message: 'Forbidden',
        status: 403,
      })
    })

    it('when requester is anonymous', () => {
      return api.post(testEndpoint).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })

    it('when custom_domains is invalid', () => {
      payload.domains = [
        // length > 10
        { domain: 'a1', verified: false },
        { domain: 'a2', verified: false },
        { domain: 'a3', verified: false },
        { domain: 'a4', verified: false },
        { domain: 'a5', verified: false },
        { domain: 'a6', verified: false },
        { domain: 'a7', verified: false },
        { domain: 'a8', verified: false },
        { domain: 'a9', verified: false },
        { domain: 'a10', verified: false },
        { domain: 'a11', verified: false },
      ]
      api.post(testEndpoint).set('Authorization', adminAuth).send(payload).expect(400, {
        code: 'InvalidFormData',
        message: 'Failed to validate request',
        status: 400,
      })

      payload.domains = [{ domain: '1w1', verified: false }]
      api.post(testEndpoint).set('Authorization', adminAuth).send(payload).expect(400, {
        code: 'InvalidFormData',
        message:
          'Custom domains can only contain lowercase characters, numbers, and dashes',
        status: 400,
      })
    })

    it('when history is invalid', () => {
      payload.history = '{"some":"json2"}'.repeat(100000)
      return api
        .post(testEndpoint)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'SiteDataLenExceeded',
          message: 'History length exceeds limit',
          status: 400,
        })
    })

    it.each(['a', 'a'.repeat(30), 'test_site', 'test-site', 'test.site', '#abc'])(
      'when site name is invalid',
      () => {
        payload.name = 'a'.repeat(51)
        return api
          .post(testEndpoint)
          .set('Authorization', adminAuth)
          .send(payload)
          .expect(400, {
            code: 'InvalidFormData',
            message: 'Failed to validate request',
            status: 400,
          })
      },
    )
  })
})
