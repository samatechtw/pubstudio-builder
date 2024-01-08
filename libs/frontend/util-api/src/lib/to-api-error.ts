import { IApiError } from '@pubstudio/shared/type-api'

export const toApiError = (e: unknown): IApiError | undefined => {
  const rsp = e as Record<string, unknown>
  if ('data' in rsp) {
    if ('code' in (rsp.data as Record<string, unknown>)) {
      return rsp.data as IApiError
    }
    return undefined
  } else if ('code' in rsp) {
    return rsp as unknown as IApiError
  }
  return undefined
}
