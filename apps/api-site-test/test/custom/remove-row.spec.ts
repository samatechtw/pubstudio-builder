import {
  CustomDataAction,
  ICustomDataApiRequest,
  IListRowsResponse,
  IRemoveRowApiRequest,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { mockAddRowPayload1 } from '../mocks/mock-add-row-payload'
import { mockListRowsPayload } from '../mocks/mock-list-rows-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Add Row', () => {
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
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()

    const removeData: IRemoveRowApiRequest = { table_name: 'contact_form', row_id: '1' }
    payload = {
      action: CustomDataAction.RemoveRow,
      data: removeData,
    }

    // Add a row
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send({
        action: CustomDataAction.AddRow,
        data: mockAddRowPayload1(),
      })
      .expect(204)
  })

  const verifyRemoved = async () => {
    const listPayload = {
      action: CustomDataAction.ListRows,
      data: mockListRowsPayload('contact_form'),
    }
    const res1 = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(listPayload)
      .expect(200)

    const body: IListRowsResponse = res1.body
    expect(body.total).toEqual(0)
  }

  it('remove row when requester is admin', async () => {
    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(204)

    await verifyRemoved()
  })

  it('remove row when requester is owner', async () => {
    const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    const ownerAuth = ownerAuthHeader(ownerId)

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(204)

    await verifyRemoved()
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
  })
})
