import { apiRequest } from '@pubstudio/shared/util-fetch-api'

interface IDbResetServiceParams {
  resetBaseUrl: string
  resetUrl: string
}

export class DbResetService {
  private resetBaseUrl: string
  private resetUrl: string

  constructor(options: IDbResetServiceParams) {
    this.resetUrl = options.resetUrl
    this.resetBaseUrl = options.resetBaseUrl
  }

  resetDb() {
    return apiRequest({
      method: 'POST',
      baseUrl: this.resetBaseUrl,
      url: this.resetUrl,
      timeout: 10000,
    })
  }
}
