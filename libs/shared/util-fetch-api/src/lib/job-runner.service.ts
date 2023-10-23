import { BasicFetchApi } from './util-fetch-api'

export class JobRunnerService {
  private helperApi: BasicFetchApi

  constructor(testHelperUrl: string) {
    this.helperApi = new BasicFetchApi({
      baseUrl: testHelperUrl,
      timeout: 10000, // ms
    })
  }

  async startJob(jobName: string) {
    return this.helperApi.get(`/jobs/actions/start?job_name=${jobName}`)
  }
}
