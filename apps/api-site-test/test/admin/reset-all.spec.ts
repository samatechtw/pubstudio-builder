import {
  ICreateSiteApiRequest,
  ICreateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockCreateSitePayload } from '../mocks/mock-create-site-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Admin reset all endpoint', () => {
  const testEndpoint = '/api/admin/actions/reset'
  let api: TestAgent
  let authHeader: string
  let payload: ICreateSiteApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
  })

  beforeEach(() => {
    authHeader = adminAuthHeader()
    payload = mockCreateSitePayload()
  })

  it('returns 200 status and message', async () => {
    // Create a site
    const response = await api
      .post('/api/sites')
      .set('Authorization', authHeader)
      .send(payload)
    const body: ICreateSiteApiResponse = response.body

    // Reset sites
    await api
      .post(testEndpoint)
      .set('Authorization', authHeader)
      .send({ seeds: SITE_SEEDS })
      .expect(200)

    // Ensure site no longer exists
    return api.get(`/api/sites/${body.id}`).set('Authorization', authHeader).expect(404)
  })

  it('returns 403 status when requester is Owner', () => {
    authHeader = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')
    return api.post(testEndpoint).set('Authorization', authHeader).expect(403, {
      code: 'None',
      message: 'Forbidden',
      status: 403,
    })
  })

  it('returns 403 status when requester is anonymous', () => {
    return api.post(testEndpoint).expect(401, {
      code: 'Unauthorized',
      message: 'Unauthorized',
      status: 401,
    })
  })
})
