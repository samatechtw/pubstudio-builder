import {
  CustomDataAction,
  ICustomDataApiRequest,
  IListTablesResponse,
  IUpdateTableApiRequest,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockListTablesPayload } from '../mocks/mock-list-tables-payload'
import { mockUpdateTablePayload } from '../mocks/mock-update-custom-table-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Update Custom Table', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let tableName: string
  let payload: ICustomDataApiRequest
  let data: IUpdateTableApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    tableName = 'contact_form'
    data = mockUpdateTablePayload(tableName)
    payload = {
      action: CustomDataAction.UpdateTable,
      data,
    }
    await resetService.reset()
  })

  const verifyTable = async () => {
    payload.action = CustomDataAction.ListTables
    payload.data = mockListTablesPayload()

    const res2 = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IListTablesResponse = res2.body
    expect(body.total).toEqual(1)
    const newName = data.new_name ?? data.old_name
    const table = body.results.find((t) => t.name === newName)

    expect(table).toBeDefined()
    if (data.events) {
      expect(table?.events).toEqual(data.events)
    }
  }

  it('updates table when requester is admin', async () => {
    data.new_name = 'new_table_name'
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    // Verify
    await verifyTable()
  })

  describe('when requester is owner', () => {
    let ownerId: string
    let ownerAuth: string

    beforeEach(() => {
      ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
      ownerAuth = ownerAuthHeader(ownerId)
    })

    it('updates table name', async () => {
      data.new_name = 'new_table_name'
      await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(200)

      // Verify
      await verifyTable()
    })

    it('updates table events', async () => {
      data.events = [
        {
          event_type: 'EmailRow',
          trigger: 'AddRow',
          options: { recipients: ['test@samatech.tw'] },
        },
        {
          event_type: 'EmailRow',
          trigger: 'UpdateRow',
          options: { recipients: ['test@samatech.tw'] },
        },
      ]
      await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(200)

      // Verify
      await verifyTable()
    })
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

    it.each([
      '',
      'a',
      '123abc',
      'a'.repeat(101),
      'site_versions',
      'custom_data_info',
      'sqlite_table',
    ])('when table_name is invalid', async (tableName: string) => {
      data.new_name = tableName

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

    it('when table already exists', async () => {
      data.new_name = 'contact_form'

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomTableNameExists',
          message: 'Table already exists',
          status: 400,
        })
    })

    it('when table event includes EmailRow with too many recipients', async () => {
      data.events = [
        {
          event_type: 'EmailRow',
          trigger: 'AddRow',
          options: {
            recipients: [
              'test@samatech.tw',
              'test1@samatech.tw',
              'test2@samatech.tw',
              'test3@samatech.tw',
              'test4@samatech.tw',
              'test5@samatech.tw',
              'test6@samatech.tw',
              'test7@samatech.tw',
              'test8@samatech.tw',
              'test9@samatech.tw',
              'test10@samatech.tw',
            ],
          },
        },
      ]
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

    it('when table event includes EmailRow with invalid recipient', async () => {
      data.events = [
        {
          event_type: 'EmailRow',
          trigger: 'AddRow',
          options: {
            recipients: [
              'testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest12345@samatech.tw',
            ],
          },
        },
      ]
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
