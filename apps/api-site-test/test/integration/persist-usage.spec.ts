import { CustomDataAction } from '@pubstudio/shared/type-api-site-custom-data'
import { IGetSiteUsageApiResponse } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader } from '../helpers/auth-helpers'
import { mockAddRowPayload1 } from '../mocks/mock-add-row-payload'
import { mockCreateTablePayload } from '../mocks/mock-create-custom-table-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Persist Site Usage', () => {
  const usageEndpoint = (siteId: string) => `/api/sites/${siteId}/usage`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    await resetService.reset()
    siteId = '2af5f0a4-c273-42ff-b5bc-847332cbb29f'
  })

  const createTable = async (siteId: string) => {
    await api
      .post(`/api/sites/${siteId}/custom_data`)
      .set('Authorization', adminAuth)
      .send({
        action: CustomDataAction.CreateTable,
        data: mockCreateTablePayload('new_custom_table'),
      })
      .expect(201)
  }

  it.only('persists custom data usage', async () => {
    // Check initial usage
    const res1 = await api
      .get(usageEndpoint(siteId))
      .set('Authorization', adminAuth)
      .expect(200)
    const body1: IGetSiteUsageApiResponse = res1.body
    expect(body1.custom_data_usage).toEqual(0)
    expect(body1.custom_data_allowance).toEqual(40000)

    await createTable(siteId)

    // Persist site usage
    await api.get('/api/actions/persist-usage').expect(200)

    // Verify updated site usage after table added
    const res2 = await api
      .get(usageEndpoint(siteId))
      .set('Authorization', adminAuth)
      .expect(200)

    const body2: IGetSiteUsageApiResponse = res2.body
    expect(body2.custom_data_usage).toEqual(65536) // 2 tables
  })

  it('returns error when custom data size exceeds allowance', async () => {
    await createTable(siteId)

    // Persist site usage and verify size increase
    await api.get('/api/actions/persist-usage').expect(200)

    // Fail to add row
    await api
      .post(`/api/sites/${siteId}/custom_data`)
      .set('Authorization', adminAuth)
      .send({
        action: CustomDataAction.AddRow,
        data: mockAddRowPayload1(),
      })
      .expect(400, {
        status: 400,
        code: 'CustomDataUsageExceeded',
        message: 'Custom data usage limit exceeded',
      })
  })
})
