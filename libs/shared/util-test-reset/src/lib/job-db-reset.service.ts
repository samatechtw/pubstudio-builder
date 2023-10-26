import { DbResetService } from './db-reset-service'

export class JobDbResetService extends DbResetService {
  constructor(testHelperUrl: string) {
    super({
      resetBaseUrl: testHelperUrl,
      resetUrl: '/states/actions',
    })
  }
}
