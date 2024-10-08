import {
  CustomDataAction,
  IAddColumnApiRequest,
  ICustomDataApiRequest,
  IListRowsResponse,
  IUpdateColumnApiResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockAddColumnPayload1 } from '../mocks/mock-add-column-payload'
import {
  mockAddInvalidRow5,
  mockAddRowPayload1,
  mockAddRowPayload4,
} from '../mocks/mock-add-row-payload'
import { mockListRowsPayload } from '../mocks/mock-list-rows-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Add Column', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let columnData: IAddColumnApiRequest
  let payload: ICustomDataApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    columnData = mockAddColumnPayload1()
    payload = {
      action: CustomDataAction.AddColumn,
      data: columnData,
    }
  })

  const verifyAddRow = async () => {
    payload.action = CustomDataAction.AddRow
    payload.data = mockAddRowPayload4()

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)
  }

  const verifyAddInvalidRow = async () => {
    payload.action = CustomDataAction.AddRow
    payload.data = mockAddInvalidRow5()

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect({
        code: 'CustomDataMaxLengthFail',
        message: 'phone must be less than 10 characters',
        status: 400,
      })
  }

  it('add column when requester is admin', async () => {
    // Add a row first to verify the new column default
    const addPayload = {
      action: CustomDataAction.AddRow,
      data: mockAddRowPayload1(),
    }
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(addPayload)
      .expect(200)

    // Add column
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateColumnApiResponse = res.body

    expect(body.id).toEqual('1')
    expect(body.name).toEqual('contact_form')
    expect(body.columns['phone']).toBeDefined()

    const listPayload = {
      action: CustomDataAction.ListRows,
      data: mockListRowsPayload('contact_form'),
    }
    const res1 = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(listPayload)
      .expect(200)
    const body1: IListRowsResponse = res1.body
    expect(body1.results[0].phone).toEqual('test-default')

    await verifyAddRow()
    await verifyAddInvalidRow()
  })

  it('add column when requester is owner', async () => {
    const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    const ownerAuth = ownerAuthHeader(ownerId)

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateColumnApiResponse = res.body

    expect(body.id).toEqual('1')
    expect(body.name).toEqual('contact_form')
    expect(body.columns['phone']).toBeDefined()

    await verifyAddRow()
    await verifyAddInvalidRow()
  })

  it('add column with existing data', async () => {
    // Add Row
    payload = {
      action: CustomDataAction.AddRow,
      data: mockAddRowPayload1(),
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    // Add Column
    payload = {
      action: CustomDataAction.AddColumn,
      data: mockAddColumnPayload1(),
    }

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateColumnApiResponse = res.body

    expect(body.id).toEqual('1')
    expect(body.name).toEqual('contact_form')
    expect(body.columns['phone']).toBeDefined()

    await verifyAddRow()
    await verifyAddInvalidRow()
  })

  it('when column name includes dash and underscore', async () => {
    payload = {
      action: CustomDataAction.AddColumn,
      data: mockAddColumnPayload1('test-col_1'),
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)
  })

  describe('when request is not valid', () => {
    it('when table_name is invalid', async () => {
      columnData.table_name = 'a'

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
      columnData.column['a'] = columnData.column['phone']

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
  })
})
