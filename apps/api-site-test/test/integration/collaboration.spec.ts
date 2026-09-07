import { collaborationTests } from '@pubstudio/shared/util-test-collaboration'
import { SiteApiResetService } from '@pubstudio/shared/util-test-reset'
import { adminAuthHeader, ownerAuthHeader } from '../helpers/auth-helpers'
import { SITE_SEEDS } from '../mocks/site-seeds'
import { testConfig } from '../test.config'

const endpoint = '/api/sites/6d2c8359-6094-402c-bcbb-37202fd7c336'
collaborationTests({
  name: 'Hosted Site Collaboration',
  apiUrl: testConfig.get('apiUrl'),
  endpoint,
  snapshotEndpoint: `${endpoint}/versions/latest`,
  otherOwnerAuth: ownerAuthHeader('0c069253-e45d-487c-b7c0-cbe467c33a10'),
  auth: ownerAuthHeader('903b3c28-deaa-45dc-a43f-511fe965d34e'),
  reset: () =>
    new SiteApiResetService(
      testConfig.get('apiUrl'),
      adminAuthHeader(),
      SITE_SEEDS,
    ).reset(),
})
