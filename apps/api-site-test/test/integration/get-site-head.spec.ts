import {
  ISiteHeadApiResponse,
  IUpdateSiteApiRequest,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Get site head', () => {
  const testEndpoint = (id: string) => `/api/sites/${id}/head`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
  })

  beforeEach(async () => {
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    await resetService.reset()
    siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
  })

  it('returns 200 status code and sites metadata for enabled site', async () => {
    const response = await api.get(testEndpoint(siteId)).expect(200)
    const body: ISiteHeadApiResponse = response.body

    expect(body.title).toEqual('Test Site 3')
    expect(body.description).toEqual('Test Site 3')
  })

  it('updates site defaults and returns correct meta title', async () => {
    const newTitle = 'SITE 3 NEWTITLE'
    const newDesc = 'SITE 3 DESCRIPTION'
    const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
    const payload: IUpdateSiteApiRequest = {
      defaults: `{"homePage":"/test","head":{"title":"${newTitle}","description":"${newDesc}"}}`,
    }
    // Update site defaults
    await api
      .patch(`/api/sites/${siteId}`)
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    // Check metadata
    const response = await api.get(testEndpoint(siteId)).expect(200)
    const body: ISiteHeadApiResponse = response.body

    expect(body.title).toEqual(newTitle)
    expect(body.description).toEqual(newDesc)
  })
})
