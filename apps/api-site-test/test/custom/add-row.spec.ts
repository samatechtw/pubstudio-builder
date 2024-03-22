import {
  Action,
  ICustomDataApiRequest,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import {
  mockAddInvalidRow1,
  mockAddInvalidRow2,
  mockAddInvalidRow3,
  mockAddInvalidRow4,
  mockAddRowPayload1,
} from '../mocks/mock-add-row-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Add Row', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let payload: ICustomDataApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    payload = {
      action: Action.AddRow,
      data: mockAddRowPayload1(),
    }
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()
  })

  it('add row when requester is admin', async () => {
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(204)
  })

  it('add row when requester is owner', async () => {
    const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    const ownerAuth = ownerAuthHeader(ownerId)

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(204)
  })

  it('add row when user is other owner', async () => {
    const ownerAuth = ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10')

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(204)
  })

  it('add row when requester is anonymous', async () => {
    await api.post(testEndpoint(siteId)).send(payload).expect(204)
  })

  describe('when request is not valid', () => {
    it('when adding a row with a duplicate unique constraint', async () => {
      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(204)

      payload.data = mockAddInvalidRow1()

      return api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'None',
          message: 'name already exists',
          status: 500,
        })
    })

    it('when adding a row with an invalid age length', async () => {
      payload.data = mockAddInvalidRow2()

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'None',
          message: 'Length check failed: age',
          status: 500,
        })

      payload.data = mockAddInvalidRow3()

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'None',
          message: 'Length check failed: age',
          status: 500,
        })
    })

    it('when adding a row with invalid email format', () => {
      const invalidEmail = '123465hjkehk'
      payload.data = mockAddInvalidRow4(invalidEmail)

      return api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'CustomColumnValidationFail',
          message: `${invalidEmail} is not a valid email`,
          status: 400,
        })
    })
  })
})
