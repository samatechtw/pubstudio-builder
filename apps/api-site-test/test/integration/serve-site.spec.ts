import { IUpdateSiteApiRequest } from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Serve site', () => {
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

  it('returns site with correct metadata', async () => {
    const response = await api.get('').set('Host', 'test3.com').expect(200)
    const body = response.text

    // Make sure response is HTML and contains site name
    expect(body.length).toBeGreaterThan(10000)
    expect(body.includes('<title>Test Site 3</title>')).toBe(true)
  })

  it('updates site defaults and returns correct meta title', async () => {
    const newTitle = 'SITE 3 NEWTITLE'
    const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
    const payload: IUpdateSiteApiRequest = {
      defaults: `{"homePage":"/test","head":{"title":"${newTitle}"}}`,
    }
    await api
      .patch(`/api/sites/${siteId}`)
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const response = await api.get('').set('Host', 'test3.com').expect(200)
    const body = response.text

    // Make sure response is HTML and contains updated meta title
    expect(body.length).toBeGreaterThan(10000)
    expect(body.includes(`<title>${newTitle}</title>`)).toBe(true)
  })

  it('updates site defaults and returns correct description', async () => {
    // Check default description is site title
    const r1 = await api.get('').set('Host', 'test3.com').expect(200)
    const b1 = r1.text
    expect(b1.includes('<meta name="description" content="Test Site 3" />')).toBe(true)

    const newDesc = 'SITE 3 DESCRIPTION'
    const siteId = '870aafc9-36e9-476a-b38c-c1aaaad9d9fe'
    const payload: IUpdateSiteApiRequest = {
      defaults: `{"homePage":"/test","head":{"description":"${newDesc}"}}`,
    }
    await api
      .patch(`/api/sites/${siteId}`)
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const r2 = await api.get('').set('Host', 'test3.com').expect(200)
    const b2 = r2.text

    // Make sure response is HTML and contains updated meta title
    expect(b2.length).toBeGreaterThan(10000)
    expect(b2.includes(`<meta name="description" content="${newDesc}" />`)).toBe(true)
    expect(b2.includes(`<meta property="og:description" content="${newDesc}" />`)).toBe(
      true,
    )
  })

  it('returns site without metadata when unpublished', async () => {
    const response = await api.get('').set('Host', 'www.myblog.org').expect(200)
    const body = response.text

    // Make sure response is HTML and doesn't contain site name
    expect(body.length).toBeGreaterThan(10000)
    expect(body.includes('<title>Test Site 2</title>')).toBe(false)
  })
})
