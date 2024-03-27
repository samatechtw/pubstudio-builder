import {
  Action,
  ICustomDataApiRequest,
  IUpdateRowResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockAddRowPayload1, mockAddRowPayload2 } from '../mocks/mock-add-row-payload'
import {
  mockUpdateInvalidRow1,
  mockUpdateInvalidRow2,
  mockUpdateInvalidRow3,
  mockUpdateInvalidRow4,
  mockUpdateRowPayload1,
  mockUpdateRowPayload2,
} from '../mocks/mock-update-row-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Update Row', () => {
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
      action: Action.UpdateRow,
      data: mockUpdateRowPayload1(),
    }
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    // Add Row
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send({
        action: Action.AddRow,
        data: mockAddRowPayload1(),
      })
      .expect(204)
  })

  it('update row when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual('Jessie')
    expect(body.updated_row['age']).toEqual('19')
    expect(body.updated_row['email']).toEqual('jjj@abc.com')
  })

  it('update row when requester is owner', async () => {
    const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    const ownerAuth = ownerAuthHeader(ownerId)

    payload.data = mockUpdateRowPayload2()

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual('Albert')
    expect(body.updated_row['age']).toEqual('30')
    expect(body.updated_row['email']).toEqual('john_test@abc.com')
  })

  describe('when request is not valid', () => {
    it('when user is other owner', () => {
      const ownerAuth = ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10')

      return api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect({
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })

    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('ecee2f88-024b-467b-81ec-bf92b06c86e1')

      return api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect({
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })

    it('when requester is anonymous', () => {
      return api.post(testEndpoint(siteId)).send(payload).expect(403, {
        code: 'None',
        message: 'Forbidden',
        status: 403,
      })
    })

    it('when updating a row with a duplicate unique constraint', async () => {
      // Add another row
      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send({
          action: Action.AddRow,
          data: mockAddRowPayload2(),
        })
        .expect(204)

      payload.data = mockUpdateInvalidRow1()

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

    it('when updating a row with an invalid age length', async () => {
      payload.data = mockUpdateInvalidRow2()

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'None',
          message: 'Length check failed: age',
          status: 500,
        })

      payload.data = mockUpdateInvalidRow3()

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

    it('when updating a row with invalid email format', () => {
      const invalidEmail = '123465hjkehk'
      payload.data = mockUpdateInvalidRow4(invalidEmail)

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