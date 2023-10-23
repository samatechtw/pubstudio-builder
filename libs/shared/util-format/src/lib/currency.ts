/**
 * Parses a string representation of the USD amount into a number
 * @param amount string representation of the USD amount
 * @returns USD amount as a number
 */
export function usdToCents(amount: string): number {
  return Math.round(
    100 * parseFloat(typeof amount === 'string' ? amount.replace(/[$,]/g, '') : amount),
  )
}

/**
 * Converts USD cents to dollar amount
 * Example: usdCentsToDollars(5575) => $55.75
 * @param cents amount to convert to USD
 * @returns amount in USD
 */
export function usdCentsToDollars(cents: number): string {
  return formatUsd(cents / 100)
}

/**
 * Converts cents to dollar amount without trailing zeros
 * Optional currency suffix
 * Example: formattedPrice(5500) => $55
 * Example: formattedPrice(500, 'USD') => $5 USD
 * @param cents amount to convert to USD
 * @returns amount in USD
 */
export function formattedPrice(cents: number, currency?: string): string {
  const dollars = usdCentsToDollars(cents)
  let str = dollars.toString()
  if (currency) {
    str = `${str} ${currency}`
  }
  return str
}

/**
 * Formats the dollar amount into USD amount prepended with a $ symbol
 * @param dollars amount in USD
 * @param showZeroCents if true then a whole number will be padded with two 0s as decimals
 * @returns formatted USD value prepended with a $ symbol
 */
export function formatUsd(dollars: number, showZeroCents?: boolean): string {
  const formatted = dollars.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
  const split = formatted.split('.')
  if (!showZeroCents && split.length >= 2 && split[split.length - 1] === '00') {
    return split[0]
  }
  return formatted
}
