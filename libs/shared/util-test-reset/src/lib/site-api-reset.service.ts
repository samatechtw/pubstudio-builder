import { apiRequest } from '@pubstudio/shared/util-fetch-api'

export class SiteApiResetService {
  private siteApiUrl: string
  private adminAuth: string
  private seeds: string[]

  constructor(siteApiUrl: string, adminAuth: string, seeds: string[]) {
    this.siteApiUrl = siteApiUrl
    this.adminAuth = adminAuth
    this.seeds = seeds
  }

  async reset() {
    await apiRequest({
      method: 'POST',
      baseUrl: this.siteApiUrl,
      url: '/api/admin/actions/reset',
      timeout: 10000,
      data: { seeds: this.seeds },
      headers: {
        Authorization: this.adminAuth,
      },
    })
  }
}
