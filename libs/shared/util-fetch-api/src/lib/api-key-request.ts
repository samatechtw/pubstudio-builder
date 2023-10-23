import { FetchRequestConfig } from '@sampullman/fetch-api'
import { ApiResponse } from './api-response'
import { BasicFetchApi } from './util-fetch-api'

export interface ApiKeyRequestOptions extends FetchRequestConfig {
  baseUrl: string
  url: string
  timeout?: number
  apiKey: string
  transform?: boolean
}

export const apiRequest = async <T>(
  options: Omit<ApiKeyRequestOptions, 'apiKey'>,
): Promise<ApiResponse<T>> => {
  const { baseUrl, timeout, ...rest } = options
  const api = new BasicFetchApi({ baseUrl, timeout })
  try {
    return await api.request<T>(rest)
  } catch (e) {
    const err = JSON.stringify(e)
    throw new Error(
      `API request failed, options=${JSON.stringify(options)}, error=${err}`,
    )
  }
}

export const apiKeyRequest = <T>(
  options: ApiKeyRequestOptions,
): Promise<ApiResponse<T>> => {
  const { headers, apiKey, ...rest } = options
  return apiRequest({
    ...rest,
    headers: {
      ...headers,
      'X-API-KEY': apiKey,
    },
  })
}
