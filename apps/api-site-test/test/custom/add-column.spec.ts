import {
  CustomDataAction,
  ICustomDataApiRequest,
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
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Add Column', () => {
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

    payload = {
      action: CustomDataAction.AddColumn,
      data: mockAddColumnPayload1(),
    }
  })

  const verifyAddRow = async () => {
    payload.action = CustomDataAction.AddRow
    payload.data = mockAddRowPayload4()

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(204)
  }

  const verifyAddInvalidRow = async () => {
    payload.action = CustomDataAction.AddRow
    payload.data = mockAddInvalidRow5()

    await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect({
        code: 'None',
        message: 'Length check failed: phone',
        status: 500,
      })
  }

  it('add column when requester is admin', async () => {
    const res = await api
      .post(testEndpoint(siteId))
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)

    const body: IUpdateColumnApiResponse = res.body

    expect(body.id).toEqual('1')
    expect(body.name).toEqual('contact_form')
    expect(body.columns).toContain('phone')

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
    expect(body.columns).toContain('phone')

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
      .expect(204)

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
    expect(body.columns).toContain('phone')

    await verifyAddRow()
    await verifyAddInvalidRow()
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
  })
})
