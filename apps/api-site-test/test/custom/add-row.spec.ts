import {
  CustomDataAction,
  IAddRowApiRequest,
  IAddRowApiResponse,
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
  let rowData: IAddRowApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    rowData = mockAddRowPayload1()
    payload = {
      action: CustomDataAction.AddRow,
      data: rowData,
    }
  })

  it('add row when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IAddRowApiResponse = res.body
    expect(body.id).toEqual('1')
    expect(body.events).toEqual(1)
  })

  it('add row when requester is owner', async () => {
    const ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(200)

    const body: IAddRowApiResponse = res.body
    expect(body.id).toEqual('1')
    expect(body.events).toEqual(1)
  })

  // Test for issue: https://github.com/samatechtw/pubstudio-builder/issues/431
  // All user data should be escaped before hitting the database
  it('add row with arbitrary string data', async () => {
    const ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')
    const data = mockAddRowPayload1()
    data.row.name = "123abc+1'ABC'\"()`<>!@#$%^&*[]{}?/"
    data.row.email = 'testemail+2@gmail.com'
    payload.data = data

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(200)

    const body: IAddRowApiResponse = res.body
    expect(body.events).toEqual(1)
  })

  it('add row when user is other owner', async () => {
    const ownerAuth = ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10')

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(200)

    const body: IAddRowApiResponse = res.body
    expect(body.events).toEqual(1)
  })

  it('add row when requester is anonymous', async () => {
    const res = await api.post(testEndpoint(siteId)).send(payload).expect(200)

    const body: IAddRowApiResponse = res.body
    expect(body.events).toEqual(1)
  })

  describe('when request is not valid', () => {
    it('when adding a row with a duplicate unique constraint', async () => {
      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      payload.data = mockAddInvalidRow1()

      return api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'CustomDataUniqueFail',
          message: 'Unique constraint violation',
          status: 400,
        })
    })

    it('when adding a row with an invalid message length', async () => {
      payload.data = mockAddInvalidRow2()

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'CustomDataMinLengthFail',
          message: 'message must be at least 3 characters',
          status: 400,
        })

      payload.data = mockAddInvalidRow3()

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'CustomDataMaxLengthFail',
          message: 'message must be less than 100 characters',
          status: 400,
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
          code: 'CustomDataInvalidEmail',
          message: 'Invalid email',
          status: 400,
        })
    })

    it('when table_name is invalid', async () => {
      rowData.table_name = 'a'

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomTableNameInvalid',
          message: 'Restricted table name',
          status: 400,
        })
    })

    it('when column name is invalid', async () => {
      rowData.row['a'] = 'TEST'

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomColumnNameInvalid',
          message: 'Invalid column name: a',
          status: 400,
        })
    })
  })
})
