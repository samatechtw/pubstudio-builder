import {
  IGetSiteApiResponse,
  IPublishSiteApiRequest,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Publish Site', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let payload: IPublishSiteApiRequest
  let siteId: string
  let ownerId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    payload = { version_id: 1 }
    await resetService.reset()
  })

  it('returns 200 status code when requester is admin', async () => {
    const response = await api
      .post(`${testEndpoint}/${siteId}/actions/publish`)
      .send(payload)
      .set('Authorization', adminAuth)

    const body: IGetSiteApiResponse = response.body

    expect(response.status).toBe(200)
    expect(body.published).toEqual(true)
  })

  it('returns 200 status code when requester is owner', async () => {
    const ownerAuth = ownerAuthHeader(ownerId)

    const response = await api
      .post(`${testEndpoint}/${siteId}/actions/publish`)
      .send(payload)
      .set('Authorization', ownerAuth)

    const body: IGetSiteApiResponse = response.body

    expect(response.status).toBe(200)
    expect(body.published).toEqual(true)
  })

  it('returns 400 status code when request is not valid', async () => {
    // Set an invalid version_id
    payload.version_id = -1

    const response = await api
      .post(`${testEndpoint}/${siteId}/actions/publish`)
      .send(payload)
      .set('Authorization', adminAuth)

    expect(response.status).toBe(400)
  })
})
