import {
  CustomDataAction,
  IAddRowApiRequest,
  ICustomDataApiRequest,
  IModifyColumnApiRequest,
  IUpdateColumnApiResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Modify Column', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let payload: ICustomDataApiRequest
  let modifyRequest: IModifyColumnApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    modifyRequest = {
      table_name: 'contact_form',
      old_column_name: 'name',
      new_column_name: 'NEW_NAME',
    }
    payload = {
      action: CustomDataAction.ModifyColumn,
      data: modifyRequest,
    }
  })

  const makeAddRowPayload = (
    nameColumn: string,
    nameValue?: string,
  ): IAddRowApiRequest => {
    return {
      table_name: 'contact_form',
      row: {
        message: 'Hello again!',
        email: 'flora@samatech.com',
        [nameColumn]: nameValue ?? 'TEST',
      },
    }
  }

  const verifyModifyColumn = async (body: IUpdateColumnApiResponse) => {
    // Verify modify response
    expect(body.id).toEqual('1')
    expect(body.name).toEqual('contact_form')
    if (modifyRequest.new_column_name) {
      expect(body.columns[modifyRequest.old_column_name]).toBe(undefined)
      expect(body.columns[modifyRequest.new_column_name]).toBeDefined()
      expect(body.columns[modifyRequest.new_column_name].name).toEqual(
        modifyRequest.new_column_name,
      )
    } else {
      expect(body.columns[modifyRequest.old_column_name]).toBeDefined()
    }

    // Add a row with the new info
    const nameColumn = modifyRequest.new_column_name ?? modifyRequest.old_column_name
    const addRow = {
      action: CustomDataAction.AddRow,
      data: makeAddRowPayload(nameColumn),
    }
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(addRow)
      .expect(200)
  }

  it('modify column name when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateColumnApiResponse = res.body
    await verifyModifyColumn(body)
  })

  describe('when requester is owner', () => {
    let ownerAuth: string

    beforeEach(() => {
      const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
      ownerAuth = ownerAuthHeader(ownerId)
    })

    it('modify column info when requester is owner', async () => {
      modifyRequest.new_column_name = undefined
      modifyRequest.new_column_info = {
        data_type: 'TEXT',
        validation_rules: [{ rule_type: 'MinLength', parameter: 2 }],
      }

      const res = await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(200)

      const body: IUpdateColumnApiResponse = res.body
      await verifyModifyColumn(body)
    })

    it('modify column name and info when requester is owner', async () => {
      modifyRequest.new_column_info = {
        data_type: 'TEXT',
        validation_rules: [{ rule_type: 'MinLength', parameter: 2 }],
      }
      const res = await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(200)

      const body: IUpdateColumnApiResponse = res.body
      verifyModifyColumn(body)

      // Verify old column cannot be included
      let addRow = {
        action: CustomDataAction.AddRow,
        data: makeAddRowPayload(modifyRequest.old_column_name),
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

      // Verify new constraint
      addRow = {
        action: CustomDataAction.AddRow,
        data: makeAddRowPayload(modifyRequest.new_column_name as string, 'A'),
      }
      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(addRow)
        .expect({
          code: 'CustomDataMinLengthFail',
          message: 'NEW_NAME must be at least 2 characters',
          status: 400,
        })
    })
  })

  describe('when request is not valid', () => {
    it('when table_name is invalid', async () => {
      modifyRequest.table_name = 'a'

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

    it('when old_column_name is invalid', async () => {
      modifyRequest.old_column_name = 'a'

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

    it('when new_column_name is invalid', async () => {
      modifyRequest.new_column_name = 'a'

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

    it('when user is other owner', () => {
      const ownerAuth = ownerAuthHeader('3ba201ff-a8d8-42bb-84ef-8470e6d97f78')

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
