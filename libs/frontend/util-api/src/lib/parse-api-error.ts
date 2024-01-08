import { IApiError } from '@pubstudio/shared/type-api'

interface I18nWrap {
  t(key: string): string
}

export function parseApiErrorKey(apiError: IApiError | undefined): string {
  const { code, message } = apiError ?? {}
  if (code) {
    return `errors.${code}`
  } else if (message) {
    return message
  } else {
    return `errors.None`
  }
}

// Returns a human readable error message from an API error
// If a fallback is not provided, 'errors.None' is used
export function parseApiError(
  i18n: I18nWrap,
  apiError: IApiError | undefined,
  fallback?: string,
): string {
  const { code, message } = apiError ?? {}
  if (fallback && code === 'None') {
    return i18n.t(fallback)
  } else if (code) {
    return i18n.t(`errors.${code}`)
  } else if (message) {
    return message
  } else {
    return i18n.t(fallback ?? 'errors.None')
  }
}
