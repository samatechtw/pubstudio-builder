import {
  IGetSiteApiResponse,
  IGetSiteVersionApiResponse,
  IListSiteVersionsApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Create Site Draft', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/actions/create_draft`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
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
    await resetService.reset()
  })

  const siteVersionCount = async (siteId: string): Promise<number> => {
    const response = await api
      .get(`/api/sites/${siteId}/versions`)
      .set('Authorization', adminAuth)
      .expect(200)
    const body: IListSiteVersionsApiResponse = response.body
    return body.length
  }

  it('creates a draft when requester is admin', async () => {
    const versionsBefore = await siteVersionCount(siteId)

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .expect(200)
    const body: IListSiteVersionsApiResponse = res.body

    expect(versionsBefore + 1).toEqual(body.length)
  })

  describe('when requestor is Owner', () => {
    let ownerAuth: string

    beforeEach(async () => {
      ownerAuth = ownerAuthHeader(ownerId)
    })

    it('creates draft when requester is owner', async () => {
      const versionsBefore = await siteVersionCount(siteId)

      const res = await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .expect(200)
      const body: IListSiteVersionsApiResponse = res.body

      expect(versionsBefore + 1).toEqual(body.length)
    })

    it('does not create draft when one already exists', async () => {
      const versionsBefore = await siteVersionCount(siteId)

      await api.post(testEndpoint(siteId)).set('Authorization', ownerAuth).expect(200)
      const res = await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .expect(200)
      const body: IListSiteVersionsApiResponse = res.body

      expect(versionsBefore + 1).toEqual(body.length)
    })

    it('creates a draft and updates it', async () => {
      siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
      ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'

      const newData1 = '{"test":"SOME TEST DATA"}'

      const res = await api.get('/api/sites/current').set('Host', 'test3.com').expect(200)
      const initialData = (res.body as IGetSiteApiResponse).pages

      // Create draft
      await api.post(testEndpoint(siteId)).set('Authorization', ownerAuth).expect(200)

      // Make sure site is live/published
      await api
        .post(`/api/sites/${siteId}/actions/publish`)
        .send({ publish: true })
        .set('Authorization', ownerAuth)
        .expect(204)

      // Update draft
      await api
        .patch(`/api/sites/${siteId}`)
        .send({ pages: newData1 })
        .set('Authorization', ownerAuth)
        .expect(200)

      // Published version not updated
      const r1 = await api.get('/api/sites/current').set('Host', 'test3.com').expect(200)
      const b1: IGetSiteVersionApiResponse = r1.body
      expect(b1.pages).toEqual(initialData)

      // Draft version updated
      const r2 = await api
        .get(`/api/sites/${siteId}/versions/latest`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const b2: IGetSiteVersionApiResponse = r2.body
      expect(b2.pages).toEqual(JSON.stringify(newData1))
    })

    it('creates draft for published site', async () => {
      siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
      ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'

      const versionsBefore = await siteVersionCount(siteId)

      const res = await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .expect(200)
      const body: IListSiteVersionsApiResponse = res.body

      expect(versionsBefore + 1).toEqual(body.length)
    })
  })

  describe('when requester is Anonymous', () => {
    it('returns 403 error', async () => {
      await api.post(testEndpoint(siteId)).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })
  })
})
