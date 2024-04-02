import { ApiResponse } from '@pubstudio/shared/type-api'
import {
  FetchApi,
  FetchRequestConfig,
  IJsonObject,
  RequestInterceptor,
  ResponseInterceptor,
} from '@sampullman/fetch-api'
import { transformRequestData } from './api-transforms'
import { defaultResponseInterceptors } from './default-response-interceptors'

export interface BasicFetchApiOptions {
  baseUrl: string
  timeout?: number
  requestInterceptors?: RequestInterceptor | RequestInterceptor[]
  responseInterceptors?: ((res: Response) => Promise<ApiResponse<IJsonObject>>)[]
}

export interface BasicFetchRequestConfig extends FetchRequestConfig {
  // This is needed because there appears to be a bug in Node's native fetch that
  // occasionally causes it to fail
  retries?: number
  // Transform dates in request data to string. Default true
  transform?: boolean
}

export class BasicFetchApi extends FetchApi<ApiResponse> {
  constructor(options: BasicFetchApiOptions) {
    const responseInterceptors = [
      ...(options.responseInterceptors ?? []),
      ...defaultResponseInterceptors,
      // TODO -- figure out why Jest suddenly requires this after packages updates
      // Consider upgrading to Vitest
    ] as unknown as ResponseInterceptor<ApiResponse>[]
    super({
      ...options,
      responseInterceptors,
    })
  }

  bearerRequest<T>(config: FetchRequestConfig, bearer: string): Promise<ApiResponse<T>> {
    const { headers, ...rest } = config
    return this.request<T>({
      ...rest,
      headers: {
        ...headers,
        Authorization: `Bearer ${bearer}`,
      },
    })
  }

  override async request<T>(config: BasicFetchRequestConfig): Promise<ApiResponse<T>> {
    const { retries, data, transform, ...rest } = config
    const finalConfig: FetchRequestConfig = {
      ...rest,
      requestJson: transform,
      data: transform ? transformRequestData(data as Record<string, unknown>) : data,
      mode: 'cors',
    }
    let requestPromise = super.request(finalConfig)
    if (!retries) {
      return requestPromise as Promise<ApiResponse<T>>
    }
    for (let i = 0; i < retries; i += 1) {
      try {
        const result = await requestPromise
        return result as ApiResponse<T>
      } catch (err) {
        const e = err as Record<string, unknown>
        console.log(`Request failed: ${this.baseUrl}${config.url}, try=${i + 1}, ${e}`)
        if ('body' in e) {
          console.log(e.body)
        }
      }
      requestPromise = super.request(finalConfig)
    }
    throw new Error(`Request failed, retries exhausted: ${retries}`)
  }

  async get(url: string): Promise<ApiResponse> {
    return this.request({ url, retries: 3 })
  }
}
