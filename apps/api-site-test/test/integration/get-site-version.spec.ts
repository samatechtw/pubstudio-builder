import { IGetSiteVersionApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import {
  adminAuthHeader,
  expiredAdminToken,
  expiredUser1Token,
  ownerAuthHeader,
} from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Get Site Version', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let ownerAuth: string
  let siteId: string
  let versionId: string

  const expectGetSiteVersion = async (authHeader: string, versionId: string) => {
    const response = await api
      .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
      .set('Authorization', authHeader)
      .expect(200)

    const body: IGetSiteVersionApiResponse = response.body

    // Perform assertions on the response body
    expect(body.id).toEqual(1)
    expect(body.name).toEqual('Test Site 2')
    expect(body.version).toEqual('2')
    expect(body.context).toBeDefined()
    expect(body.defaults).toBeDefined()
    expect(body.editor).toBeDefined()
    expect(body.history).toBeDefined()
    expect(body.pages).toBeDefined()
    expect(body.published).toEqual(false)
  }

  beforeAll(async () => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
  })

  beforeEach(async () => {
    ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
  })

  describe('when version id is latest', () => {
    beforeEach(() => {
      versionId = 'latest'
    })

    it('returns 200 when requestor is Admin', async () => {
      await expectGetSiteVersion(adminAuth, versionId)
    })

    it('returns 200 when requestor is Owner', async () => {
      await expectGetSiteVersion(ownerAuth, versionId)
    })

    it('returns 403 when requestor is other Owner', async () => {
      ownerAuth = ownerAuthHeader('3ba201ff-a8d8-42bb-84ef-8470e6d97f78')
      return api.get(`${testEndpoint}/${siteId}/versions/${versionId}`).expect(401)
    })

    it('returns 401 when requestor is Anonymous', () => {
      return api.get(`${testEndpoint}/${siteId}/versions/${versionId}`).expect(401)
    })
  })

  describe('when version id is number', () => {
    beforeEach(() => {
      versionId = '1'
    })

    it('returns 200 when requestor is Admin', async () => {
      await expectGetSiteVersion(adminAuth, versionId)
    })

    it('returns 200 when requestor is Owner', async () => {
      await expectGetSiteVersion(ownerAuth, versionId)
    })

    it('returns site data if current update_key is older than content_updated_at', async () => {
      const prevResponse = await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const prevBody: IGetSiteVersionApiResponse = prevResponse.body

      const response = await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .query({ update_key: prevBody.content_updated_at - 100 })
        .set('Authorization', adminAuth)
        .expect(200)
      const body: IGetSiteVersionApiResponse = response.body

      expect(body.id).toEqual(1)
      expect(body.name).toEqual('Test Site 2')
      expect(body.published).toEqual(false)
      expect(body.version).toEqual('2')
      expect(body.context).toBeDefined()
      expect(body.defaults).toBeDefined()
      expect(body.editor).toBeDefined()
      expect(body.history).toBeDefined()
      expect(body.pages).toBeDefined()
    })

    it('returns empty site if current update_key matches saved content_updated_at', async () => {
      const prevResponse = await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const prevBody: IGetSiteVersionApiResponse = prevResponse.body

      const response = await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .query({ update_key: prevBody.content_updated_at })
        .set('Authorization', adminAuth)
        .expect(204)

      expect(response.body).toEqual({})
    })

    it('returns empty site if current update_key is new than content_updated_at', async () => {
      const prevResponse = await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .set('Authorization', ownerAuth)
        .expect(200)
      const prevBody: IGetSiteVersionApiResponse = prevResponse.body

      const response = await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .query({ update_key: prevBody.content_updated_at + 100 })
        .set('Authorization', adminAuth)
        .expect(204)

      expect(response.body).toEqual({})
    })

    it('returns 400 when update_key is invalid', async () => {
      await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .query({ update_key: '2023-11-07T08:25:58.131123' })
        .set('Authorization', adminAuth)
        .expect(400)
    })

    it('returns 403 error when not published and owner_id does not match', () => {
      const otherOwnerAuth = ownerAuthHeader('3ba201ff-a8d8-42bb-84ef-8470e6d97f78')
      return api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .set('Authorization', otherOwnerAuth)
        .expect(403)
    })

    it('returns 401 when admin token has expired', async () => {
      await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .set('Authorization', expiredAdminToken)
        .expect(401, {
          code: 'InvalidAuth',
          message: 'Unauthorized',
          status: 401,
        })
    })

    it('returns 401 when owner token has expired', async () => {
      await api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .set('Authorization', expiredUser1Token)
        .expect(401, {
          code: 'InvalidAuth',
          message: 'Unauthorized',
          status: 401,
        })
    })
  })

  it('returns 400 when version id is invalid', async () => {
    versionId = 'abcdefg'

    await api
      .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
      .set('Authorization', adminAuth)
      .expect(400)
  })

  it('returns 403 error when requester is anonymous', async () => {
    await api.get(`${testEndpoint}/${siteId}/versions/${versionId}`).expect(401, {
      code: 'Unauthorized',
      message: 'Unauthorized',
      status: 401,
    })
  })
})
