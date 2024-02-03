import { fixed2 } from '@pubstudio/shared/util-format'
import { formatISO } from 'date-fns/formatISO'

export function str2bool(str: string): boolean | undefined {
  try {
    return JSON.parse(str)
  } catch (e) {
    return undefined
  }
}

export const formatInUtc = (date: Date) => {
  const year = date.getUTCFullYear()
  const month = fixed2(date.getUTCMonth() + 1)
  const day = fixed2(date.getUTCDate())
  const hour = fixed2(date.getUTCHours())
  const minute = fixed2(date.getUTCMinutes())
  const second = fixed2(date.getUTCSeconds())
  return `${year}-${month}-${day}T${hour}:${minute}:${second}+00:00`
}

export function date2str(date: Date, utc?: boolean): string {
  if (utc) {
    return formatInUtc(date)
  }
  return formatISO(date)
}
