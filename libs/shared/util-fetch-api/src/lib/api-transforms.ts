import { commonRegex, date2str } from '@pubstudio/shared/util-parse'

const dateRegex = new RegExp(commonRegex.date)

export const transformApiDate = (date: Date): string => {
  return date2str(date, true)
}

// Convert request payload types to JSON
export const transformRequestData = (
  data?: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!data) {
    return undefined
  }
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Date) {
      data[key] = transformApiDate(value)
    }
  }
  return data
}

// Convert response payload from JSON
export const transformResponseData = (data?: Record<string, unknown>) => {
  if (!data) {
    return data
  }
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object') {
      transformResponseData(value as Record<string, unknown>)
    }
    if (typeof value === 'string' && value.match(dateRegex)) {
      data[key] = new Date(value)
    }
  }
}
