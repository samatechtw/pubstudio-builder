import { FetchApi, FetchRequestConfig, IJsonObject } from '@sampullman/fetch-api'
import { Ref } from 'vue'

export class ApiResponse<T = IJsonObject> extends Response {
  data!: T
}

export const defaultResponseInterceptors = [
  async (res: Response): Promise<ApiResponse> => {
    if (!res) {
      throw new Error('NETWORK_FAILURE')
    }
    const { status } = res

    if (status >= 500) {
      try {
        console.log('500 error:', await res.json())
      } catch (e) {
        console.log('500 error:', e)
      }
      throw new Error('NETWORK_FAILURE')
    } else if (status === 403) {
      // Permission denied
      throw res
    }
    let data: IJsonObject
    try {
      data = await res.json()
    } catch (_e) {
      // Avoid crashing on empty response
      data = {}
    }

    if (status === 400 || status === 404) {
      throw data
    }
    const apiRes = res as ApiResponse
    apiRes.data = data
    return apiRes
  },
]

export interface PSApiOptions {
  baseUrl: string
  userToken: Ref<string | null>
  cors?: boolean
  responseInterceptors?: ((res: Response) => Promise<ApiResponse>)[]
}

export class SiteApi extends FetchApi<ApiResponse> {
  userToken: Ref<string | null>
  cors: boolean

  constructor(options: PSApiOptions) {
    const responseInterceptors = [
      ...(options.responseInterceptors ?? []),
      ...defaultResponseInterceptors,
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
