import { IListSiteVersionsApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Delete Draft', () => {
  const createDraftEndpoint = (siteId: string) =>
    `/api/sites/${siteId}/actions/create_draft`
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/actions/delete_draft`
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

  it('deletes a draft when requester is admin', async () => {
    // Create a draft for delete
    await api
      .post(createDraftEndpoint(siteId))
      .set('Authorization', adminAuth)
      .expect(200)
    const versionsBefore = await siteVersionCount(siteId)

    await api.delete(testEndpoint(siteId)).set('Authorization', adminAuth).expect(200)

    const versionsAfter = await siteVersionCount(siteId)

    expect(versionsBefore - 1).toEqual(versionsAfter)
  })

  describe('when requestor is Owner', () => {
    let ownerAuth: string

    beforeEach(async () => {
      ownerAuth = ownerAuthHeader(ownerId)
    })

    it('deletes draft when requester is owner', async () => {
      // Create a draft for delete
      await api
        .post(createDraftEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .expect(200)
      const versionsBefore = await siteVersionCount(siteId)

      await api.delete(testEndpoint(siteId)).set('Authorization', ownerAuth).expect(200)

      const versionsAfter = await siteVersionCount(siteId)

      expect(versionsBefore - 1).toEqual(versionsAfter)
    })

    it('returns 400 when there is no draft to delete', async () => {
      await api.delete(testEndpoint(siteId)).set('Authorization', ownerAuth).expect(400, {
        code: 'None',
        message: 'Request is missing draft',
        status: 400,
      })
    })
  })

  describe('when requester is Anonymous', () => {
    it('returns 403 error', async () => {
      await api.delete(testEndpoint(siteId)).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })
  })
})
