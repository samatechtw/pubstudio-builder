import { AssetContentType } from '@pubstudio/shared/type-api-platform-site-asset'
import { ICountryItem } from './i-billing-countries'

/**
 * Convert 12345 to '12,345'
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US')
}

const SIMPLIFY_NUMBER_SYMBOLS = ['', 'k', 'M']

/**
 * Convert 1000 to '1k', 1234 to '1.2k', or 1,000,000 to '1M'.
 * @see https://stackoverflow.com/a/40724354
 */
export function simplifyNumber(value: number): string {
  const tier = (Math.log10(Math.abs(value)) / 3) | 0
  if (tier === 0) {
    return value.toString()
  }
  const suffix = SIMPLIFY_NUMBER_SYMBOLS[tier]
  const scaled = value / Math.pow(10, tier * 3)
  const simplifiedValue = Number.isInteger(scaled) ? scaled.toString() : scaled.toFixed(1)
  return simplifiedValue + suffix
}

// Return a string representation of `n` with minimum 2 digits
export function fixed2(n: number): string {
  return n < 10 ? `0${n}`.slice(-2) : `${n}`
}

// Return a string with the decimal place truncated to n digits
export function strFixed(str: string, n: number): string {
  if (!str) {
    return str
  }
  const arr = str.split('.')
  if (arr.length === 1) {
    return str
  }
  return `${arr[0]}.${arr[1].substring(0, n)}`
}

export function truncate(text: string, maxLength: number): string {
  if (maxLength <= 3) {
    return '.'.repeat(maxLength)
  }
  if (text.length > maxLength) {
    return `${text?.slice(0, maxLength - 3)}...`
  }
  return text
}

// Shorten a string and add ellipses to the gap
export function shorten(text: string, fromStart: number, fromEnd: number): string {
  // If text is lengthened by adding ellipses, return it
  if (!text || text.length <= fromStart + fromEnd + 3) {
    return text
  }
  return `${text.substring(0, fromStart)}...${text.substring(text.length - fromEnd)}`
}

export function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function contentTypeExt(contentType: AssetContentType): string {
  return {
    [AssetContentType.Jpeg]: 'jpg',
    [AssetContentType.Png]: 'png',
    [AssetContentType.Gif]: 'gif',
    [AssetContentType.Mp4]: 'mp4',
    [AssetContentType.Pdf]: 'pdf',
    [AssetContentType.Wasm]: 'wasm',
    [AssetContentType.Js]: 'js',
  }[contentType]
}

export const BILLING_COUNTRIES: ICountryItem[] = [
  { label: 'United States', value: '840', phone: '1' },
  { label: 'Australia', value: '036', phone: '61' },
  { label: 'Austria', value: '040', phone: '43' },
  { label: 'Belgium', value: '056', phone: '32' },
  { label: 'Canada', value: '124', phone: '1' },
  { label: 'Czech Republic', value: '203', phone: '420' },
  { label: 'Denmark', value: '208', phone: '45' },
  { label: 'Italy', value: '380', phone: '39' },
  { label: 'Japan', value: '392', phone: '81' },
  { label: 'Netherlands', value: '528', phone: '31' },
  { label: 'Germany', value: '276', phone: '49' },
  { label: 'Finland', value: '246', phone: '358' },
  { label: 'France', value: '250', phone: '33' },
  { label: 'Ireland', value: '372', phone: '353' },
  { label: 'Mexico', value: '484', phone: '52' },
  { label: 'Philippines', value: '608', phone: '63' },
  { label: 'Norway', value: '744', phone: '47' },
  { label: 'Singapore', value: '702', phone: '65' },
  { label: 'South Korea', value: '410', phone: '82' },
  { label: 'Spain', value: '724', phone: '34' },
  { label: 'Sweden', value: '752', phone: '46' },
  { label: 'Switzerland', value: '756', phone: '41' },
  { label: 'Taiwan', value: '158', phone: '886' },
  { label: 'Thailand', value: '764', phone: '66' },
  { label: 'United Arab Emirates', value: '784', phone: '971' },
  { label: 'United Kingdom', value: '826', phone: '44' },
  { label: 'Vietnam', value: '704', phone: '84' },
]

export function convertCountry(
  fieldFrom: keyof ICountryItem,
  value: string,
  fieldTo: keyof ICountryItem,
): string | undefined {
  for (const item of BILLING_COUNTRIES) {
    if (value === item[fieldFrom]) {
      return item[fieldTo]
    }
  }
  return undefined
}

export function phoneWithoutCode(number: string, code: string): string {
  if (!number) return number
  let result = number
  if (result.startsWith('+')) {
    result = result.substring(1)
  }
  if (result.startsWith(code)) {
    result = result.substring(code.length)
  }
  return result
}
