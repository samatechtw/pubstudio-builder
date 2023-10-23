import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Get Site Version', () => {
  const testEndpoint = '/api/sites'
  let api: supertest.SuperTest<supertest.Test>
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

    const body: IGetSiteApiResponse = response.body

    // Perform assertions on the response body
    expect(body.id).toEqual(1)
    expect(body.name).toEqual('Test Site 2')
    expect(body.version).toEqual('0.1')
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
    it('returns 200 when requestor is Admin', async () => {
      versionId = 'latest'
      await expectGetSiteVersion(adminAuth, versionId)
    })

    it('returns 200 when requestor is Owner', async () => {
      versionId = 'latest'
      await expectGetSiteVersion(ownerAuth, versionId)
    })

    it('returns 200 when requestor is Owner', async () => {
      ownerAuth = ownerAuthHeader('3ba201ff-a8d8-42bb-84ef-8470e6d97f78')
      versionId = 'latest'
      await expectGetSiteVersion(ownerAuth, versionId)
    })

    it('returns 200 when requestor is Anonymous', () => {
      versionId = 'latest'
      return api.get(`${testEndpoint}/${siteId}/versions/${versionId}`).expect(200)
    })
  })

  describe('when version id is number', () => {
    it('returns 200 when requestor is Admin', async () => {
      versionId = '1'
      await expectGetSiteVersion(adminAuth, versionId)
    })

    it('returns 200 when requestor is Owner', async () => {
      versionId = '1'
      await expectGetSiteVersion(ownerAuth, versionId)
    })

    it('returns 403 forbidden when requester is other Owner', () => {
      ownerAuth = ownerAuthHeader('3ba201ff-a8d8-42bb-84ef-8470e6d97f78')
      versionId = '1'
      return api
        .get(`${testEndpoint}/${siteId}/versions/${versionId}`)
        .set('Authorization', ownerAuth)
        .expect(403, {
          code: 'None',
          message: 'Forbidden',
          status: 403,
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
})
