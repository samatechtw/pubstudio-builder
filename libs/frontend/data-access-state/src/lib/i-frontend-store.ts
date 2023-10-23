import { assetModule } from './asset-store'
import { authModule } from './auth-store'
import { miscModule } from './misc-store'
import { userModule } from './user-store'

/**
 * Need this interface to solve ts(4023) error.
 * Exported variable '...' has or is using name '...' from external module "..." but cannot be named.
 */
export interface IFrontendStore {
  misc: typeof miscModule
  auth: typeof authModule
  user: typeof userModule
  asset: typeof assetModule
}
