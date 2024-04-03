import {
  CustomDataAction,
  ICustomDataApiRequest,
  IListRowsResponse,
} from '@pubstudio/shared/type-api-site-custom-data'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import {
  mockAddRowPayload1,
  mockAddRowPayload2,
  mockAddRowPayload3,
} from '../mocks/mock-add-row-payload'
import { mockListRowsPayload } from '../mocks/mock-list-rows-payload'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('List Rows', () => {
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
    payload = {
      action: CustomDataAction.ListRows,
      data: mockListRowsPayload('contact_form'),
    }
  })

  beforeEach(async () => {
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    await resetService.reset()
  })

  it('list rows when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const beforeLen = 0
    const body: IListRowsResponse = res.body
    expect(body.total).toEqual(beforeLen)

    // Add Row
    const addPayload = {
      action: CustomDataAction.AddRow,
      data: mockAddRowPayload1(),
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(addPayload)
      .expect(204)

    // Verify
    const res1 = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body1: IListRowsResponse = res1.body
    expect(body1.total).toEqual(beforeLen + 1)
  })

  it('list rows when requester is owner and filtering from 2 to 3', async () => {
    const ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    const ownerAuth = ownerAuthHeader(ownerId)

    // Add Rows
    const addPayload1 = {
      action: CustomDataAction.AddRow,
      data: mockAddRowPayload1(),
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(addPayload1)
      .expect(204)

    const addPayload2 = {
      action: CustomDataAction.AddRow,
      data: mockAddRowPayload2(),
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(addPayload2)
      .expect(204)

    const addPayload3 = {
      action: CustomDataAction.AddRow,
      data: mockAddRowPayload3(),
    }

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(addPayload3)
      .expect(204)

    // List
    payload.data = mockListRowsPayload('contact_form', 2, 3)

    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(200)

    const body: IListRowsResponse = res.body

    expect(body.total).toEqual(3)

    expect(body.results[0]['name']).toEqual('Andy')
    expect(body.results[0]['age']).toEqual('40')
    expect(body.results[0]['email']).toEqual('andy123@gmail.com')

    expect(body.results[1]['name']).toEqual('Flora')
    expect(body.results[1]['age']).toEqual('18')
    expect(body.results[1]['email']).toEqual('flora@samatech.com')
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
