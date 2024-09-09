import {
  CustomDataAction,
  ICustomDataApiRequest,
  ICustomTableRow,
  IGetRowApiQuery,
  IRowFilters,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockAddRowPayload1, mockAddRowPayload2 } from '../mocks/mock-add-row-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('List Rows', () => {
  const testEndpoint = (siteId: string) => `/api/sites/${siteId}/custom_data`
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let siteId: string
  let ownerId: string
  let tableName: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  const makePayload = (filters?: IRowFilters): ICustomDataApiRequest => {
    const data: IGetRowApiQuery = {
      table_name: tableName,
      filters,
    }
    return {
      action: CustomDataAction.GetRow,
      data,
    }
  }

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    await resetService.reset()

    tableName = 'contact_form'

    // Add rows
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send({
        action: CustomDataAction.AddRow,
        data: mockAddRowPayload1(),
      })
      .expect(200)
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send({
        action: CustomDataAction.AddRow,
        data: mockAddRowPayload2(),
      })
      .expect(200)
  })

  it('get first row when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(makePayload())
      .expect(200)

    const body: ICustomTableRow = res.body
    expect(body.name).toEqual('John')
  })

  it('get row filtered by name', async () => {
    const payload = makePayload({ field_eq: { field: 'name', value: 'Andy' } })
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: ICustomTableRow = res.body
    expect(body.name).toEqual('Andy')
  })

  describe('when requestor is Owner', () => {
    let ownerAuth: string

    beforeEach(async () => {
      ownerAuth = ownerAuthHeader(ownerId)
    })

    it('get row filtered by name', async () => {
      const payload = makePayload({ field_eq: { field: 'name', value: 'John' } })
      const res = await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(200)

      const body: ICustomTableRow = res.body
      expect(body.name).toEqual('John')
    })

    it('no matching row', async () => {
      const payload = makePayload({ field_eq: { field: 'name', value: 'Jim' } })
      const res = await api
        .post(testEndpoint(siteId))
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(200)

      expect(res.body).toBeNull()
    })
  })

  describe('when requestor is anonymous', () => {
    it('get row filtered by name', async () => {
      const payload = makePayload({ field_eq: { field: 'name', value: 'John' } })
      const res = await api.post(testEndpoint(siteId)).send(payload).expect(200)

      const body: ICustomTableRow = res.body
      expect(body.name).toEqual('John')
    })
  })

  describe('when request is not valid', () => {
    it('when table_name is invalid', async () => {
      const payload: ICustomDataApiRequest = {
        action: CustomDataAction.GetRow,
        data: { table_name: 'a' },
      }

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
  })
})
