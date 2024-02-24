import {
  IGetSiteVersionApiResponse,
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
    payload = { publish: true }
    await resetService.reset()
  })

  const verifyPublished = async (siteId: string, published: boolean) => {
    const response = await api
      .get(`${testEndpoint}/${siteId}/versions/latest`)
      .set('Authorization', adminAuth)
      .expect(200)
    const body: IGetSiteVersionApiResponse = response.body
    expect(body.published).toEqual(published)
  }

  it('publishes site when requester is admin', async () => {
    await api
      .post(`${testEndpoint}/${siteId}/actions/publish`)
      .send(payload)
      .set('Authorization', adminAuth)
      .expect(204)

    await verifyPublished(siteId, true)
  })

  describe('when requestor is Owner', () => {
    let ownerAuth: string

    beforeEach(async () => {
      ownerAuth = ownerAuthHeader(ownerId)
    })

    it('publishes site when requester is owner', async () => {
      await api
        .post(`${testEndpoint}/${siteId}/actions/publish`)
        .send(payload)
        .set('Authorization', ownerAuth)
        .expect(204)

      await verifyPublished(siteId, true)
    })

    it('unpublishes site when requester is owner', async () => {
      payload.publish = false

      await api
        .post(`${testEndpoint}/${siteId}/actions/publish`)
        .send(payload)
        .set('Authorization', ownerAuth)
        .expect(204)

      await verifyPublished(siteId, false)
    })

    it('creates a draft, updates it, and publishes', async () => {
      const newData1 = '{"test":"SOME TEST DATA"}'
      // Create a draft
      await api
        .post(`/api/sites/${siteId}/actions/create_draft`)
        .set('Authorization', ownerAuth)
        .expect(200)

      // Update the draft
      await api
        .patch(`/api/sites/${siteId}`)
        .send({ pages: newData1 })
        .set('Authorization', ownerAuth)
        .expect(200)

      // Publish the draft
      await api
        .post(`${testEndpoint}/${siteId}/actions/publish`)
        .send(payload)
        .set('Authorization', ownerAuth)
        .expect(204)

      // Verify published version is updated
      const r1 = await api
        .get(`/api/sites/${siteId}/versions/1`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const body1: IGetSiteVersionApiResponse = r1.body
      expect(body1.pages).toEqual(JSON.stringify(newData1))

      // Update the draft again
      await api
        .patch(`/api/sites/${siteId}`)
        .send({ pages: '{"test":"SOME NEWER DATA"}' })
        .set('Authorization', ownerAuth)
        .expect(200)

      // Verify published version is not changed
      const r2 = await api
        .get(`/api/sites/${siteId}/versions/1`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const body2: IGetSiteVersionApiResponse = r2.body
      expect(body2.pages).toEqual(JSON.stringify(newData1))
    })
  })

  describe('when requester is Anonymous', () => {
    it('returns 403 error', async () => {
      await api.post(`${testEndpoint}/${siteId}/actions/publish`).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })
  })
})
