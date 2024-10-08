import { SiteType } from '@pubstudio/shared/type-api-platform-site'
import { ICustomDomainRelationViewModel } from '@pubstudio/shared/type-api-shared'
import {
  IGetSiteDomainsApiResponse,
  IListSitesApiResponse,
  ISiteMetadata,
  IUpdateSiteMetadataApiRequest,
} from '@pubstudio/shared/type-api-site-sites'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import supertest from 'supertest'
import TestAgent from 'supertest/lib/agent'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

describe('Update Site Metadata', () => {
  const testEndpoint = '/api/sites_metadata'
  let api: TestAgent
  let resetService: SiteApiResetService
  let adminAuth: string
  let ownerAuth: string
  let domains: ICustomDomainRelationViewModel[]
  let payload: IUpdateSiteMetadataApiRequest
  let siteId: string

  beforeAll(() => {
    api = supertest(testConfig.get('apiUrl'))
    adminAuth = adminAuthHeader()
    ownerAuth = ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e')
    resetService = new SiteApiResetService('http://127.0.0.1:3100', adminAuth, SITE_SEEDS)
  })

  beforeEach(async () => {
    await resetService.reset()
    siteId = '6d2c8359-6094-402c-bcbb-37202fd7c336'
    domains = [
      { domain: 'update-subdomain.dev.pubstud.io', verified: true },
      { domain: 'shop.abc.com', verified: false },
    ]
    payload = { domains }
  })

  describe('when requester is admin', () => {
    it('returns 200 status and message when update metadata', async () => {
      await api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      // Verify domains are updated
      const getResponse = await api
        .get(`/api/sites/${siteId}/domains`)
        .set('Authorization', adminAuth)
        .expect(200)
      const getBody: IGetSiteDomainsApiResponse = getResponse.body

      expect(getBody.domains).toEqual(payload.domains)
    })

    it('returns 200 status and message when update site type', async () => {
      payload.site_type = SiteType.Paid1
      await api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      // Verify site_type is updated
      const getResponse = await api
        .get('/api/sites')
        .set('Authorization', adminAuth)
        .expect(200)
      const body: IListSitesApiResponse = getResponse.body
      const targetSite = body.find((site) => site.id.toString() == siteId)

      expect(targetSite?.site_type).toEqual(payload.site_type)
    })

    it('returns 200 status and message when update owner email', async () => {
      payload.owner_email = 'newemail@test.com'
      await api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      // Verify owner email is updated
      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .expect(200)
      const body: ISiteMetadata = response.body

      expect(body?.owner_email).toEqual(payload.owner_email)
    })

    it('returns 200 status and message when update owner id', async () => {
      payload.owner_id = '3ba201ff-a8d8-42bb-84ef-8470e6d97f78'
      await api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      // Verify owner id is updated
      const response = await api
        .get(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .expect(200)
      const body: ISiteMetadata = response.body

      expect(body?.owner_id).toEqual(payload.owner_id)
    })

    it('disables site and verifies it cannot be retrieved', async () => {
      payload = {
        disabled: true,
      }
      await api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(200)

      // Verify owner can no longer access
      await api
        .get(`/api/sites/${siteId}/versions/latest`)
        .set('Authorization', ownerAuth)
        .expect(403, {
          code: 'SiteDisabled',
          message: 'Forbidden',
          status: 403,
        })

      // Verify anonymous can no longer access
      await api.get('/api/sites/current').set('Host', 'www.myblog.org').expect(403, {
        code: 'SiteDisabled',
        message: 'Forbidden',
        status: 403,
      })
    })
  })

  describe('when requester is owner', () => {
    it('returns 200 status and message when update metadata', async () => {
      await api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', ownerAuth)
        .send(payload)
        .expect(200)

      // Verify domains are updated
      const getResponse = await api
        .get(`/api/sites/${siteId}/domains`)
        .set('Authorization', adminAuth)
        .expect(200)
      const getBody: IGetSiteDomainsApiResponse = getResponse.body

      expect(getBody.domains).toEqual(payload.domains)
    })

    it('returns 403 when updates site_type', () => {
      payload.site_type = SiteType.Paid1
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

    it('returns 403 when owner updates disabled', () => {
      payload.disabled = true
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

    it('returns 400 when domains is invalid', () => {
      payload.domains = [
        // length > 10
        { domain: 'a1', verified: false },
        { domain: 'a2', verified: false },
        { domain: 'a3', verified: false },
        { domain: 'a4', verified: false },
        { domain: 'a5', verified: false },
        { domain: 'a6', verified: false },
        { domain: 'a7', verified: false },
        { domain: 'a8', verified: false },
        { domain: 'a9', verified: false },
        { domain: 'a10', verified: false },
        { domain: 'a11', verified: false },
      ]
      api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'InvalidFormData',
          message: 'Failed to validate request',
          status: 400,
        })

      payload.domains = [{ domain: '1w1', verified: false }]
      api
        .patch(`${testEndpoint}/${siteId}`)
        .set('Authorization', adminAuth)
        .send(payload)
        .expect(400, {
          code: 'InvalidFormData',
          message:
            'Custom domains can only contain lowercase characters, numbers, and dashes',
          status: 400,
        })
    })
  })
})
