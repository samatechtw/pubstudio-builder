import {
  IBackupAllApiResponse,
  IListSiteBackupsApiResponse,
} from '@pubstudio/shared/type-api-site-backup'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Backup All', () => {
  const testEndpoint = '/api/admin/actions/backup_all'
  let api: TestAgent
  let adminAuth: string
  let resetService: SiteApiResetService

  beforeAll(async () => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
  })

  const listBackups = async (siteId: string): Promise<IListSiteBackupsApiResponse> => {
    const listResponse = await api
      .get(`/api/sites/${siteId}/backups`)
      .set('Authorization', adminAuth)
      .expect(200)
    const listBody: IListSiteBackupsApiResponse = listResponse.body
    return listBody
  }

  it('returns 200 status code and backup result when requester is admin', async () => {
    const response = await api.post(testEndpoint).set('Authorization', adminAuth)
    const body: IBackupAllApiResponse = response.body

    expect(body.total_sites).toEqual(3)
    expect(body.successful_backups).toEqual(3)
  })

  it('creates 4 backups and deletes the oldest one', async () => {
    await api.post(testEndpoint).set('Authorization', adminAuth)
    // Get the first backup, to verify it's deleted later
    const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
    const backupsBefore = await listBackups(siteId)
    expect(backupsBefore.length).toEqual(1)
    const firstBackupId = backupsBefore[0].id

    await api.post(testEndpoint).set('Authorization', adminAuth)
    await api.post(testEndpoint).set('Authorization', adminAuth)
    const response = await api.post(testEndpoint).set('Authorization', adminAuth)
    const body: IBackupAllApiResponse = response.body

    expect(body.total_sites).toEqual(3)
    expect(body.successful_backups).toEqual(3)

    // Verify first backup deleted
    const backupsAfter = await listBackups(siteId)
    const firstBackup = backupsAfter.find((b) => b.id === firstBackupId)
    expect(firstBackup).toBeUndefined()
  })

  describe('when request is not valid', () => {
    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')

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
  })
})
