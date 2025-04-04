import { IUpdateSiteApiRequest } from '@pubstudio/shared/type-api-site-sites'

export const mockUpdateSitePayload = (): IUpdateSiteApiRequest => ({
  name: 'Test Site UPDATE',
  version: '2',
  context: '{"some":"json2"}',
  defaults: '{"some":"json2"}',
  editor: '{"some":"json2"}',
  history: '{"some":"json2"}',
  pages: '{"some":"json2"}',
  pageOrder: '["some2"]',
})
