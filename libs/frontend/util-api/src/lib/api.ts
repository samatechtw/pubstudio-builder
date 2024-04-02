import { ApiResponse } from '@pubstudio/shared/type-api'
import {
  defaultResponseInterceptors,
  transformRequestData,
} from '@pubstudio/shared/util-fetch-api'
import { FetchApi, FetchRequestConfig } from '@sampullman/fetch-api'
import { Ref } from 'vue'

export interface PSApiOptions {
  baseUrl: string
  userToken?: Ref<string | null>
  cors?: boolean
  responseInterceptors?: ((res: Response) => Promise<ApiResponse>)[]
}

export class PSApi extends FetchApi<ApiResponse> {
  userToken?: Ref<string | null>
  cors: boolean

  constructor(options: PSApiOptions) {
    const responseInterceptors = [
      ...(options.responseInterceptors ?? defaultResponseInterceptors),
    ]
    super({
      ...options,
      responseInterceptors,
    })
    this.userToken = options.userToken
    this.cors = options.cors ?? true
  }

  authRequest<T>(config: FetchRequestConfig): Promise<ApiResponse<T>> {
    const { headers, ...rest } = config
    let authHeaders = headers
    if (this.userToken?.value) {
      authHeaders = {
        ...headers,
        Authorization: `Bearer ${this.userToken.value}`,
      }
    }
    return this.request<T>({
      ...rest,
      headers: authHeaders,
    })
  }

  authOptRequest<T>(config: FetchRequestConfig): Promise<ApiResponse<T>> {
    if (this.userToken?.value) {
      return this.authRequest(config)
    } else {
      return this.request(config)
    }
  }

  override async request<T>(config: FetchRequestConfig): Promise<ApiResponse<T>> {
    const configHeaders = config.headers as Record<string, string> | undefined
    const contentType = configHeaders?.['Content-Type'] || 'application/json'
    const finalConfig: FetchRequestConfig = {
      ...config,
      data: transformRequestData(config.data as Record<string, unknown>),
      mode: this.cors ? 'cors' : 'no-cors',
      headers: {
        ...config.headers,
        'Content-Type': contentType,
      },
    }
    return super.request(finalConfig) as unknown as ApiResponse<T>
  }
}
