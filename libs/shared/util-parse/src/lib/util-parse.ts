import { formatISO } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'

export function str2bool(str: string): boolean | undefined {
  try {
    return JSON.parse(str)
  } catch (e) {
    return undefined
  }
}

// See https://www.npmjs.com/package/date-fns-tz#time-zone-formatting
const formatInTimeZone = (date: Date, fmt: string, tz: string) =>
  format(utcToZonedTime(date, tz), fmt, { timeZone: tz })

export function date2str(date: Date, timezone?: string): string {
  if (timezone) {
    return formatInTimeZone(date, "yyyy-MM-dd'T'HH:mm:ssxxx", timezone)
  }
  return formatISO(date)
}
