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

  const getUsage = async () => {
    const res = await api
      .get(`/api/sites/${siteId}/usage`)
      .set('Authorization', adminAuth)
      .expect(200)

    return res.body as IGetSiteUsageApiResponse
  }

  it('persists request count and bandwidth', async () => {
    // Use site with custom domain
    siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'

    // Verify initial usage
    const body1 = await getUsage()
    const initialSiteSize = body1.site_size
    expect(body1.request_count).toEqual(1)
    expect(body1.total_request_count).toEqual(1)
    expect(body1.site_view_count).toEqual(0)
    expect(body1.total_site_view_count).toEqual(0)
    expect(body1.page_views).toEqual({})
    expect(body1.total_page_views).toEqual({})
    expect(body1.total_bandwidth).toEqual(initialSiteSize)
    expect(body1.current_monthly_bandwidth).toEqual(initialSiteSize)

    // Make site requests
    await api.get('/api/sites/current').set('Host', 'test3.localhost').expect(200)
    await api.get('/api/sites/current').set('Host', 'test3.localhost').expect(200)
    await api
      .post(`/api/sites/${siteId}/usage/actions/page_view`)
      .set('Host', 'test3.localhost')
      .send({ route: '/home' })
      .expect(200)

    // Verify
    const body2 = await getUsage()
    expect(body2.request_count).toEqual(3)
    expect(body2.total_request_count).toEqual(3)
    expect(body2.site_view_count).toEqual(2)
    expect(body2.total_site_view_count).toEqual(2)
    expect(body2.page_views).toEqual({ '/home': 1 })
    expect(body2.total_page_views).toEqual({ '/home': 1 })
    expect(body2.total_bandwidth).toEqual(initialSiteSize * 3)
    expect(body2.current_monthly_bandwidth).toEqual(initialSiteSize * 3)

    // Persist usage
    await api.get('/api/actions/persist-usage').expect(200)

    // Verify usage reset
    const body3 = await getUsage()
    expect(body3.request_count).toEqual(0)
    expect(body3.total_request_count).toEqual(3)
    expect(body3.site_view_count).toEqual(0)
    expect(body3.total_site_view_count).toEqual(2)
    expect(body3.page_views).toEqual({})
    expect(body3.total_page_views).toEqual({ '/home': 1 })
    expect(body3.total_bandwidth).toEqual(0)
    expect(body3.current_monthly_bandwidth).toEqual(initialSiteSize * 3)

    // Update site to trigger cache reset
    await api
      .patch(`/api/sites/${siteId}`)
      .set('Authorization', adminAuth)
      .send({ name: 'NEW NAME' })
      .expect(200)

    // Verify usage after update
    const body4 = await getUsage()
    expect(body4.request_count).toEqual(1)
    expect(body4.total_request_count).toEqual(4)
    expect(body4.site_view_count).toEqual(0)
    expect(body4.total_site_view_count).toEqual(2)
    expect(body4.page_views).toEqual({})
    expect(body4.total_page_views).toEqual({ '/home': 1 })
    expect(body4.total_bandwidth).toEqual(initialSiteSize)
    expect(body4.current_monthly_bandwidth).toEqual(initialSiteSize * 4)

    // Make site requests
    await api.get('/api/sites/current').set('Host', 'test3.localhost').expect(200)
    await api.get('/api/sites/current').set('Host', 'test3.localhost').expect(200)
    await api
      .post(`/api/sites/${siteId}/usage/actions/page_view`)
      .set('Host', 'test3.localhost')
      .send({ route: '/home' })
      .expect(200)

    // Persist again
    await api.get('/api/actions/persist-usage').expect(200)

    // Verify usage reset
    const body5 = await getUsage()
    expect(body5.request_count).toEqual(0)
    expect(body5.total_request_count).toEqual(6)
    expect(body5.site_view_count).toEqual(0)
    expect(body5.total_site_view_count).toEqual(4)
    expect(body5.page_views).toEqual({})
    expect(body5.total_page_views).toEqual({ '/home': 2 })
    expect(body5.total_bandwidth).toEqual(0)
    expect(body5.current_monthly_bandwidth).toEqual(initialSiteSize * 6)
  })

  it('persists custom data usage', async () => {
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
