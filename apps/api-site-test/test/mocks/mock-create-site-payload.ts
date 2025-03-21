import { ICreateSiteApiRequest } from '@pubstudio/shared/type-api-site-sites'

export const mockCreateSitePayload = (): ICreateSiteApiRequest => ({
  id: '1d2ba801-21ff-4243-b015-261496e60e3a',
  owner_id: '903b3c28-deaa-45dc-a43f-511fe965d34e',
  owner_email: 'user1@samatech.tw',
  name: 'Test Site',
  published: false,
  version: '2',
  context: '{"some":"stringified_json"}',
  defaults: '{"some":"stringified_json"}',
  editor: '{"some":"stringified_json"}',
  history: '{"some":"stringified_json"}',
  pages: '{"some":"stringified_json"}',
  pageOrder: '["some"]',
  domains: [{ domain: 'test-subdomain', verified: true }],
  site_type: 'Free',
})
