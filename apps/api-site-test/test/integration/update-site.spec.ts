import {
  IGetSiteApiResponse,
  IUpdateSiteApiRequest,
  IUpdateSiteApiResponse,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { mockUpdateSitePayload } from '../mocks/update-create-site-payload'
import { testConfig } from '../test.config'

describe('Update Site', () => {
  const testEndpoint = '/api/sites'
  let api: supertest.SuperTest<supertest.Test>
  let resetService: SiteApiResetService
  let adminAuth: string
  let payload: IUpdateSiteApiRequest
  let siteId: string
  let ownerId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
    payload = mockUpdateSitePayload()
  })

  beforeEach(async () => {
    await resetService.reset()
    ownerId = '903b3c28-deaa-45dc-a43f-511fe965d34e'
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
  })

  it('updates site and verifies result when requester is admin', async () => {
    const response = await api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)
    const body: IUpdateSiteApiResponse = response.body

    expect(body.name).toEqual(payload.name)
    expect(body.version).toEqual(payload.version)
    expect(JSON.parse(body.context)).toEqual(payload.context)
    expect(JSON.parse(body.defaults)).toEqual(payload.defaults)
    expect(JSON.parse(body.editor)).toEqual(payload.editor)
    expect(JSON.parse(body.history)).toEqual(payload.history)
    expect(JSON.parse(body.pages)).toEqual(payload.pages)
  })

  it('updates site and verifies result when requester is owner', async () => {
    const ownerAuth = ownerAuthHeader(ownerId)
    const response = await api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', ownerAuth)
      .send(payload)
      .expect(200)
    const body: IUpdateSiteApiResponse = response.body

    expect(body.name).toEqual(payload.name)
    expect(body.version).toEqual(payload.version)
    expect(JSON.parse(body.context)).toEqual(payload.context)
    expect(JSON.parse(body.defaults)).toEqual(payload.defaults)
    expect(JSON.parse(body.editor)).toEqual(payload.editor)
    expect(JSON.parse(body.history)).toEqual(payload.history)
    expect(JSON.parse(body.pages)).toEqual(payload.pages)
  })

  it('updates site when update_key matches the saved updated_at', async () => {
    const prevResponse = await api
      .get(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .expect(200)

    const prevBody: IGetSiteApiResponse = prevResponse.body

    payload.update_key = prevBody.updated_at.toString()

    const response = await api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(200)
    const body: IUpdateSiteApiResponse = response.body

    expect(body.name).toEqual(payload.name)
    expect(body.version).toEqual(payload.version)
    expect(JSON.parse(body.context)).toEqual(payload.context)
    expect(JSON.parse(body.defaults)).toEqual(payload.defaults)
    expect(JSON.parse(body.editor)).toEqual(payload.editor)
    expect(JSON.parse(body.history)).toEqual(payload.history)
    expect(JSON.parse(body.pages)).toEqual(payload.pages)
  })

  describe('when request is not valid', () => {
    it('when user is other owner', () => {
      const ownerAuth = ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10')

      return api
        .patch(`${testEndpoint}/${siteId}`)
        .send(payload)
        .set('Authorization', ownerAuth)
        .expect(403, {
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })

    it('when user is not authorized', () => {
      const ownerAuth = ownerAuthHeader('ecee2f88-024b-467b-81ec-bf92b06c86e1')

      return api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(403, {
          code: 'None',
          message: 'Forbidden',
          status: 403,
        })
    })

    it('when requester is anonymous', () => {
      return api.patch(`${testEndpoint}/${siteId}`).send(payload).expect(401, {
        code: 'Unauthorized',
        message: 'Unauthorized',
        status: 401,
      })
    })

    it('when update_key does not match the saved updated_at', () => {
      payload.update_key = '2023-11-07T08:25:58.131123Z'
      return api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'UpdateStale',
          message: 'update_key did not match',
          status: 400,
        })
    })
  })

  it('when context is invalid', () => {
    payload.context = '{"some":"json2"}'.repeat(100000)
    return api
      .patch(`${testEndpoint}/${siteId}`)
      .set('Authorization', adminAuth)
      .send(payload)
      .expect(400, {
        code: 'SiteDataLenExceeded',
        message: 'Context length exceeds limit',
        status: 400,
      })
  })

  it.each(['a', 'a'.repeat(30), 'test_site', 'test-site', 'test.site', '#abc'])(
    'when site name is invalid',
    () => {
      payload.name = 'a'.repeat(51)
      return api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'InvalidFormData',
          message: 'Failed to validate request',
          status: 400,
        })
    },
  )
})
