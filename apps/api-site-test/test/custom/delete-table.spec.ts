import {
  CustomDataAction,
  ICustomDataApiRequest,
  IDeleteTableApiRequest,
  IModifyColumnApiRequest,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockAddRowPayload1 } from '../mocks/mock-add-row-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Delete Table', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let payload: ICustomDataApiRequest
  let deleteData: IDeleteTableApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    deleteData = { table_name: 'contact_form' }
    payload = {
      action: CustomDataAction.DeleteTable,
      data: deleteData,
    }
  })

  it('delete table when requester is admin', async () => {
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(204)
  })

  it('delete table when requester is owner', async () => {
    const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    const ownerAuth = ownerAuthHeader(ownerId)

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(204)

    // Add row fails
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send({
        action: CustomDataAction.AddRow,
        data: mockAddRowPayload1(),
      })
      .expect(400, {
        code: 'CustomTableNotFound',
        message: 'Failed to validate request',
        status: 400,
      })

    // Modify column info fails
    const modifyRequest: IModifyColumnApiRequest = {
      table_name: 'contact_form',
      old_column_name: 'name',
      new_column_info: {
        data_type: 'TEXT',
        validation_rules: [{ rule_type: 'MinLength', parameter: 2 }],
      },
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send({
        action: CustomDataAction.ModifyColumn,
        data: modifyRequest,
      })
      .expect(400, {
        code: 'CustomTableNotFound',
        message: 'Failed to validate request',
        status: 400,
      })
  })

  describe('when request is not valid', () => {
    it('when table_name is invalid', async () => {
      deleteData.table_name = 'a'

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
  })
})
