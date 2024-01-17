import { IGetSiteApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Restore Backup', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
  let adminAuth: string
  let ownerAuth: string
  let resetService: SiteApiResetService
  let siteId: string
  let backupId: string

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
    backupId = '3'

    // Backup all
    await api
      .post('/api/admin/actions/backup_all')
      .set('Authorization', adminAuth)
      .expect(200)
  })

  describe('when requester is admin', () => {
    it('returns 200 status code and message', async () => {
      await api
        .post(`${testEndpoint}/${siteId}/backups/${backupId}/actions/restore`)
        .set('Authorization', adminAuth)
        .expect(200)

      // Verify backup has restored
      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .expect(200)

      const body: IGetSiteApiResponse = response.body
      expect(body.name).toEqual('TEST BACKUP')
      expect(body.published).toEqual(false)
    })
  })

  describe('when requester is owner', () => {
    it('returns 200 status code and message', async () => {
      await api
        .post(`${testEndpoint}/${siteId}/backups/${backupId}/actions/restore`)
        .set('Authorization', ownerAuth)
        .expect(200)

      // Verify backup has restored
      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', ownerAuth)
        .expect(200)

      const body: IGetSiteApiResponse = response.body
      expect(body.name).toEqual('TEST BACKUP')
      expect(body.published).toEqual(false)
    })
  })

  describe('when request is not valid', () => {
    it('when backup id is not valid', () => {
      const backupId = 'abc'

      return api
        .post(`${testEndpoint}/${siteId}/backups/${backupId}/actions/restore`)
        .set('Authorization', ownerAuth)
        .expect({
          code: 'None',
          message: 'Failed to parse backup ID',
          status: 400,
        })
    })

    it('when backup id does not exist', () => {
      const backupId = '10'

      return api
        .post(`${testEndpoint}/${siteId}/backups/${backupId}/actions/restore`)
        .set('Authorization', ownerAuth)
        .expect({
          code: 'None',
          message: 'no rows returned by a query that expected to return at least one row',
          status: 404,
        })
    })

    it('when backup site id does not match provided site id', () => {
      const backupId = '2'

      return api
        .post(`${testEndpoint}/${siteId}/backups/${backupId}/actions/restore`)
        .set('Authorization', ownerAuth)
        .expect({
          code: 'None',
          message: 'Backup site_id does not match the request site_id',
          status: 400,
        })
    })

    it('when requester is not site owner', () => {
      const siteId = '2af5f0a4-c273-42ff-b5bc-847332cbb29f' // admin1's site

      return api
        .post(`${testEndpoint}/${siteId}/backups/${backupId}/actions/restore`)
        .set('Authorization', ownerAuth)
        .expect({
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })

    it('when requester is anonymous', () => {
      return api
        .post(`${testEndpoint}/${siteId}/backups/${backupId}/actions/restore`)
        .expect(401, {
          code: 'Unauthorized',
          message: 'Unauthorized',
          status: 401,
        })
    })
  })
})
