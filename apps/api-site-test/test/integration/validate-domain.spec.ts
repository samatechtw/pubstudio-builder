import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Validate Site Domain', () => {
  const testEndpoint = '/api/sites/validate_domain'
  let api: TestAgent
  let resetService: SiteApiResetService

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    const adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    await resetService.reset()
  })

  describe('when request with valid hostname', () => {
    it('returns 200 response for subdomain', () => {
      const execEnv = testConfig.get('execEnv')
      return api
        .get(testEndpoint)
        .query({ domain: `my-subdomain.${execEnv}.pubstud.io` })
        .expect(200)
    })

    it('returns 200 response for custom domain', () => {
      return api.get(testEndpoint).query({ domain: 'www.myblog.org' }).expect(200)
    })
  })

  it('returns an error for invalid hostname', async () => {
    await api.get(testEndpoint).query({ domain: 'bad-domain.com' }).expect(404)
  })

  it('returns an error for missing hostname', async () => {
    await api.get(testEndpoint).expect(400)
  })
})
