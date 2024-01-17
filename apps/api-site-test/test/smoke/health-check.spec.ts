import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { testConfig } from '../test.config'

describe('Health check endpoint', () => {
  let api: TestAgent

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
  })

  it('returns 200 status code and message', () => {
    return api.get('/api/healthz').expect(200, 'Endpoint is healthy')
  })
})
