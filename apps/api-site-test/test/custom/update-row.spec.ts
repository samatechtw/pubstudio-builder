import {
  CustomDataAction,
  ICustomDataApiRequest,
  ICustomTableColumnRule,
  IModifyColumnApiRequest,
  IUpdateRowApiRequest,
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
  let updateData: IUpdateRowApiRequest

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    updateData = mockUpdateRowPayload1()
    payload = {
      action: CustomDataAction.UpdateRow,
      data: updateData,
    }

    // Add Row
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send({
        action: CustomDataAction.AddRow,
        data: mockAddRowPayload1(),
      })
      .expect(200)
  })

  const makePayload = (row: Record<string, string>) => {
    updateData = {
      table_name: 'contact_form',
      row_id: 1,
      new_row: row,
    }
    payload = {
      action: CustomDataAction.UpdateRow,
      data: updateData,
    }
    return payload
  }

  const addValidators = async (noEmail?: boolean) => {
    const rules: ICustomTableColumnRule[] = [
      { rule_type: 'MinLength', parameter: 4 },
      { rule_type: 'MaxLength', parameter: 30 },
      { rule_type: 'Unique' },
      { rule_type: 'Required' },
    ]
    if (!noEmail) {
      rules.push({ rule_type: 'Email' })
    }
    const modifyRequest: IModifyColumnApiRequest = {
      table_name: 'contact_form',
      old_column_name: 'name',
      new_column_info: {
        data_type: 'TEXT',
        validation_rules: rules,
      },
    }
    const payload = {
      action: CustomDataAction.ModifyColumn,
      data: modifyRequest,
    }
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)
  }

  it('update row when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual('Jessie')
    expect(body.updated_row['message']).toEqual('Hello there!')
    expect(body.updated_row['email']).toEqual('jjj@abc.com')
  })

  it('update one field in row', async () => {
    const name = 'Tester Name'
    const payload = makePayload({ name })
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual(name)
    expect(body.updated_row['message']).toEqual('Hello there!')
    expect(body.updated_row['email']).toEqual('john_test@abc.com')
  })

  it('update a field to the same value when it is Unique', async () => {
    await addValidators(true)
    const name = 'John'
    const payload = makePayload({ name })

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual('John')
    expect(body.updated_row['message']).toEqual('Hello there!')
    expect(body.updated_row['email']).toEqual('john_test@abc.com')
  })

  it('update a field, when another field has validators', async () => {
    await addValidators()
    const message = 'Update message'
    const payload = makePayload({ message })

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual('John')
    expect(body.updated_row['message']).toEqual(message)
    expect(body.updated_row['email']).toEqual('john_test@abc.com')
  })

  it('update a field with validators', async () => {
    await addValidators()
    const name = 'sama@samatech.tw'
    const payload = makePayload({ name })

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual(name)
    expect(body.updated_row['message']).toEqual('Hello there!')
    expect(body.updated_row['email']).toEqual('john_test@abc.com')
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
    expect(body.updated_row['message']).toEqual('Hello there!')
    expect(body.updated_row['email']).toEqual('john_test@abc.com')
  })

  it('when user is not authorized', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual('Jessie')
    expect(body.updated_row['message']).toEqual('Hello there!')
    expect(body.updated_row['email']).toEqual('jjj@abc.com')
  })

  it('when requester is anonymous', async () => {
    const res = await api.post(testEndpoint(siteId)).send(payload).expect(200)

    const body: IUpdateRowResponse = res.body

    expect(body.updated_row['name']).toEqual('Jessie')
    expect(body.updated_row['message']).toEqual('Hello there!')
    expect(body.updated_row['email']).toEqual('jjj@abc.com')
  })

  describe('when request is not valid', () => {
    it('when MinLength validator is not met', async () => {
      await addValidators()
      const name = 's@s'
      const payload = makePayload({ name })

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomDataMinLengthFail',
          message: 'name must be at least 4 characters',
          status: 400,
        })
    })

    it('when MaxLength validator is not met', async () => {
      await addValidators()
      const name = 'thisemailistoolongforthecolumn@alongwebsitenamedotcom.com'
      const payload = makePayload({ name })

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomDataMaxLengthFail',
          message: 'name must be less than 30 characters',
          status: 400,
        })
    })

    it('when Required validator is not met', async () => {
      await addValidators()
      const name = ''
      const payload = makePayload({ name })

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomDataMinLengthFail',
          message: 'name must be at least 4 characters',
          status: 400,
        })
    })

    it('when Email validator is not met', async () => {
      await addValidators()
      const name = 'test'
      const payload = makePayload({ name })

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'CustomDataInvalidEmail',
          message: 'Invalid email',
          status: 400,
        })
    })

    it('when table_name is invalid', async () => {
      updateData.table_name = 'a'

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
      updateData.new_row = {
        a: 'Jessie',
        message: 'Test Jessie!',
        email: 'jjj@abc.com',
      }

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

    it('when updating a row with a duplicate unique constraint', async () => {
      // Add another row
      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send({
          action: CustomDataAction.AddRow,
          data: mockAddRowPayload2(),
        })
        .expect(200)

      payload.data = mockUpdateInvalidRow1()

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

    it('when updating a row with an invalid message length', async () => {
      payload.data = mockUpdateInvalidRow2()

      await api
        .post(testEndpoint(siteId))
        .set('Authorization', adminAuth)
        .send(payload)
        .expect({
          code: 'CustomDataMinLengthFail',
          message: 'message must be at least 3 characters',
          status: 400,
        })

      payload.data = mockUpdateInvalidRow3()

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

    it('when updating a row with invalid email format', () => {
      const invalidEmail = '123465hjkehk'
      payload.data = mockUpdateInvalidRow4(invalidEmail)

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
  })
})
