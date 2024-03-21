import {
  Action,
  ICreateTableResponse,
  ICustomDataApiRequest,
  IListTablesResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockCreateTablePayload } from '../mocks/mock-create-custom-table-payload'
import { mockListTablesPayload } from '../mocks/mock-list-tables-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Create Custom Table', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let tableName: string
  let payload: ICustomDataApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    tableName = 'custom_table'
    payload = {
      action: Action.CreateTable,
      data: mockCreateTablePayload(tableName),
    }
    await resetService.reset()
  })

  const verifyTable = async () => {
    payload.action = Action.ListTables
    payload.data = mockListTablesPayload()

    const res2 = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body2: IListTablesResponse = res2.body
    expect(body2.total).toEqual(2)

    expect(body2.results[0].id).toEqual('1')
    expect(body2.results[0].name).toEqual('contact_form')
    expect(body2.results[1].id).toEqual('2')
    expect(body2.results[1].name).toEqual(tableName)
  }

  it('creates table when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(201)

    const body: ICreateTableResponse = res.body

    expect(body.id).toEqual('2')

    // Verify
    await verifyTable()
  })

  it('creates table when requester is owner', async () => {
    const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    const ownerAuth = ownerAuthHeader(ownerId)

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(201)

    // Verify
    await verifyTable()
  })

  describe('when request is not valid', () => {
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

    it('when table_name is invalid', async () => {
      payload.action = Action.CreateTable
      payload.data = mockCreateTablePayload('site_versions')

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomTableNameExists',
          message: 'table_name cannot be site_versions or custom_data_info',
          status: 400,
        })

      payload.data = mockCreateTablePayload('custom_data_info')

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomTableNameExists',
          message: 'table_name cannot be site_versions or custom_data_info',
          status: 400,
        })
    })

    it('when table_name is empty', async () => {
      payload.data = mockCreateTablePayload('')

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'InvalidFormData',
          message: 'Failed to validate request',
          status: 400,
        })
    })
  })
})
