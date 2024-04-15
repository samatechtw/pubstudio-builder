import { ApiResponse } from '@pubstudio/shared/type-api'
import { FetchApi, FetchRequestConfig } from '@sampullman/fetch-api'
import { Ref, ref } from 'vue'
import { plainResponseInterceptors } from './plain-response-interceptors'

export interface PSApiOptions {
  baseUrl: string
  userToken: Ref<string | null>
  cors?: boolean
  responseInterceptors?: ((res: Response) => Promise<ApiResponse>)[]
}

export class SiteApi extends FetchApi<ApiResponse> {
  userToken: Ref<string | null>
  siteId: Ref<string | undefined> = ref()
  cors: boolean

  constructor(options: PSApiOptions) {
    const responseInterceptors = [
      ...(options.responseInterceptors ?? []),
      ...plainResponseInterceptors,
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
    return this.request<T>({
      ...rest,
      headers: {
        ...headers,
        Authorization: `Bearer ${this.userToken.value}`,
      },
    })
  }

  authOptRequest<T>(config: FetchRequestConfig): Promise<ApiResponse<T>> {
    if (this.userToken.value) {
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
      data: config.data,
      mode: this.cors ? 'cors' : 'no-cors',
      headers: {
        ...config.headers,
        'Content-Type': contentType,
      },
    }
    return super.request(finalConfig) as unknown as ApiResponse<T>
  }
}
