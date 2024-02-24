import {
  assetModule,
  authModule,
  IFrontendStore,
  miscModule,
  userModule,
} from '@pubstudio/frontend/data-access-state'
import { scratchSiteModule } from './scratch-site-store'
import { siteModule } from './site-store'
import { versionModule } from './version-store'

export interface WebStore extends IFrontendStore {
  version: typeof versionModule
  site: typeof siteModule
  scratchSite: typeof scratchSiteModule
}

export const store: WebStore = {
  misc: miscModule,
  auth: authModule,
  asset: assetModule,
  user: userModule,
  version: versionModule,
  site: siteModule,
  scratchSite: scratchSiteModule,
}
