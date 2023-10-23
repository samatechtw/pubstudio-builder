import {
  assetModule,
  authModule,
  IFrontendStore,
  miscModule,
  userModule,
} from '@pubstudio/frontend/data-access-state'
import { scratchSiteModule } from './scratch-site-store'
import { siteModule } from './site-store'

export interface WebStore extends IFrontendStore {
  site: typeof siteModule
  scratchSite: typeof scratchSiteModule
}

export const store: WebStore = {
  misc: miscModule,
  auth: authModule,
  asset: assetModule,
  user: userModule,
  site: siteModule,
  scratchSite: scratchSiteModule,
}
