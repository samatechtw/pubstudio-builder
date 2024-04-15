import { ApiResponse } from '@pubstudio/shared/type-api'
import { IJsonObject } from '@sampullman/fetch-api'

// Convert errors to exceptions and extract JSON
export const plainResponseInterceptors = [
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
