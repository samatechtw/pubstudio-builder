import { ApiResponse } from '@pubstudio/shared/type-api'
import { plainResponseInterceptors } from '@pubstudio/shared/util-web-site-api'
import { transformResponseData } from './api-transforms'

// Transforms API date strings to Date
export const defaultResponseInterceptors = [
  async (res: Response): Promise<ApiResponse> => {
    const apiRes = await plainResponseInterceptors[0](res)
    transformResponseData(apiRes.data)
    return apiRes
  },
]
