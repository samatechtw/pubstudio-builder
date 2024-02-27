import {
  IGetSiteApiResponse,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Publish Site', () => {
  const testEndpoint = '/api/sites'
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    await resetService.reset()
  })

  it('returns preview site when site is unpublished and requester is anonymous', async () => {
    const siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    // Create preview link
    const previewRes = await api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .send({ enable_preview: true })
      .expect(200)
    const previewId = (previewRes.body as IUpdateSiteApiResponse).preview_id

    // Get current site with preview
    const response = await api
      .get('/api/sites/current')
      .set('Host', 'www.myblog.org')
      .query({ p: previewId })
      .expect(200)

    const body: IGetSiteApiResponse = response.body
    expect(body.name).toEqual('Test Site 2')
  })

  it('returns preview site when site is published and requester is anonymous', async () => {
    const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
    // Create preview link
    const previewRes = await api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .send({ enable_preview: true })
      .expect(200)
    const previewId = (previewRes.body as IUpdateSiteApiResponse).preview_id

    // Get current site with preview
    const response = await api
      .get('/api/sites/current')
      .set('Host', 'test3.com')
      .query({ p: previewId })
      .expect(200)

    const body: IGetSiteApiResponse = response.body
    expect(body.name).toEqual('Test Site 3')
  })

  it('returns preview site when site has draft', async () => {
    const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
    const newContext = '{"test": "data"}'

    // Create draft
    await api
      .post(`/api/sites/${siteId}/actions/create_draft`)
      .set('Authorization', adminAuth)
      .expect(200)

    // Update draft
    await api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .send({ context: newContext })
      .expect(200)

    // Create preview link
    const previewRes = await api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .send({ enable_preview: true })
      .expect(200)
    const previewId = (previewRes.body as IUpdateSiteApiResponse).preview_id

    // Get current site with preview
    const response = await api
      .get('/api/sites/current')
      .set('Host', 'test3.com')
      .query({ p: previewId })
      .expect(200)

    const body: IGetSiteApiResponse = response.body
    expect(body.name).toEqual('Test Site 3')
    expect(body.context).toEqual(JSON.stringify(newContext))
  })

  it('returns error when preview id does not exist', () => {
    const previewId = 'ec748a5b-c859-45ab-a6fa-32de492c4651'
    return api
      .get('/api/sites/current')
      .set('Host', 'www.myblog.org')
      .query({ p: previewId })
      .expect(404, {
        code: 'None',
        message: 'Site preview not found',
        status: 404,
      })
  })
})
