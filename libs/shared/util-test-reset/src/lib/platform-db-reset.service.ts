import { DbResetService } from './db-reset-service'

export class PlatformDbResetService extends DbResetService {
  constructor(testHelperUrl: string) {
    super({
      resetBaseUrl: testHelperUrl,
      resetUrl: '/actions/reset/db-platform',
    })
  }
}
