import { IListSiteBackupsApiResponse } from '@pubstudio/shared/type-api-site-backup'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('List Backups', () => {
  const testEndpoint = '/api/sites'
  let api: supertest.SuperTest<supertest.Test>
  let adminAuth: string
  let ownerAuth: string
  let resetService: SiteApiResetService
  let siteId: string

  beforeAll(async () => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
  })

  beforeEach(async () => {
    await resetService.reset()
    ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')
    siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'

    // Backup all
    await api
      .post('/api/admin/actions/backup_all')
      .set('Authorization', adminAuth)
      .expect(200)
  })

  describe('when requester is admin', () => {
    it('returns 200 status code and site backups', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}/backups`)
        .set('Authorization', adminAuth)
        .expect(200)

      const body: IListSiteBackupsApiResponse = response.body
      expect(body.length).toEqual(1)
      expect(body[0].site_id).toEqual(siteId)
      expect(body[0].url).toMatch(
        /^[0-9a-fA-F-]+\/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.db$/,
      )
    })
  })

  describe('when requester is owner', () => {
    it('returns 200 status code and site backups', async () => {
      const response = await api
        .get(`${testEndpoint}/${siteId}/backups`)
        .set('Authorization', ownerAuth)
        .expect(200)

      const body: IListSiteBackupsApiResponse = response.body
      expect(body.length).toEqual(1)
      expect(body[0].site_id).toEqual(siteId)
      expect(body[0].url).toMatch(
        /^[0-9a-fA-F-]+\/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.db$/,
      )
    })
  })

  describe('when request is not valid', () => {
    it('when requester is not site owner', () => {
      const siteId = '2af5f0a4-c273-42ff-b5bc-847332cbb29f' // admin1's site

      return api
        .get(`${testEndpoint}/${siteId}/backups`)
        .set('Authorization', ownerAuth)
        .expect({
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })

    it('when requester is anonymous', () => {
      return api.get(`${testEndpoint}/${siteId}/backups`).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })
  })
})
