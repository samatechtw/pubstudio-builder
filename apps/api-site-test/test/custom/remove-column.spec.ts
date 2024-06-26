import {
  CustomDataAction,
  ICustomDataApiRequest,
  IRemoveColumnApiRequest,
  IRemoveColumnApiResponse,
  IUpdateColumnApiResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockAddRowPayload1 } from '../mocks/mock-add-row-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Remove Column', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let removeCol: string
  let payload: ICustomDataApiRequest
  let removeData: IRemoveColumnApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    removeCol = 'name'
    removeData = {
      table_name: 'contact_form',
      column_name: removeCol,
    }
    payload = {
      action: CustomDataAction.RemoveColumn,
      data: removeData,
    }
  })

  const verifyRemoveColumn = async () => {
    const addRow = {
      action: CustomDataAction.AddRow,
      data: {
        table_name: 'contact_form',
        row: {
          message: 'HELLO',
          email: 'flora@samatech.com',
          name: 'TEST',
        },
      },
    }
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(addRow)
      .expect({
        code: 'CustomDataInvalidColumn',
        message: 'Invalid column: name',
        status: 400,
      })
  }

  it('remove column when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IRemoveColumnApiResponse = res.body

    expect(body.id).toEqual('1')
    expect(body.name).toEqual('contact_form')
    expect(body.columns[removeCol]).toBe(undefined)

    await verifyRemoveColumn()
  })

  it('remove column when requester is owner', async () => {
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
    expect(body.columns[removeCol]).toBe(undefined)

    await verifyRemoveColumn()
  })

  it('remove column with existing data', async () => {
    // Add Row
    const addPayload = {
      action: CustomDataAction.AddRow,
      data: mockAddRowPayload1(),
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(addPayload)
      .expect(200)

    // Remove Column
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateColumnApiResponse = res.body

    expect(body.id).toEqual('1')
    expect(body.name).toEqual('contact_form')
    expect(body.columns[removeCol]).toBe(undefined)

    await verifyRemoveColumn()
  })

  describe('when request is not valid', () => {
    it('when table_name is invalid', async () => {
      removeData.table_name = 'a'

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

    it('when column names are invalid', async () => {
      removeData.column_name = 'a'

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
