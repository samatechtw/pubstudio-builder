const fetch = jest.fn(() => {
  return Promise.resolve({
    body: 'mock-body',
    json: Promise.resolve('mock-json'),
  })
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(global as any).fetch = fetch

import { date2str } from '@pubstudio/shared/util-parse'
import { FetchRequestConfig } from '@sampullman/fetch-api'
import { computed } from 'vue'
import { PSApi } from './api'

describe('web API', () => {
  const baseUrl = '/test/'
  const token = computed(() => 'test')

  it('should be configured', () => {
    const api = new PSApi({
      baseUrl,
      userToken: token,
    })
    expect(api.baseUrl).toEqual(baseUrl)
  })

  it('should transform Dates to UTC timestamps', async () => {
    const data = { date1: new Date() }

    const api = new PSApi({
      baseUrl,
      userToken: token,
    })

    api.interceptRequest(
      async (config: FetchRequestConfig): Promise<FetchRequestConfig> => {
        // Intercept the response to make sure we actually transform Dates to UTC timestamps
        const reqData = (config as FetchRequestConfig).data as Record<string, unknown>

        expect(typeof reqData?.date1).toEqual('string')
        expect(reqData?.date1).toEqual(data.date1)
        expect(reqData?.date1).toEqual(date2str(data.date1, 'UTC'))
        throw new Error('Test interceptor complete')
      },
    )
    expect(api.request({ url: 'datetest', data })).rejects.toThrow(
      'Test interceptor complete',
    )
  })
})
