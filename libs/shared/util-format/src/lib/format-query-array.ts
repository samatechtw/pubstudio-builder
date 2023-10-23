// Returns a serialized array for use in an API query string
// e.g. arrayToQuery('num', [1, 2, 3]) => 'num[]=1&num[]=2&num[]=3'
export function arrayToQuery(
  arrayName: string,
  array: Array<number | string | null>,
): string {
  if (array.length === 0) {
    return ''
  }
  let result = array.reduce(
    (prev: string, cur) => `${prev}&${arrayName}=${encodeURIComponent(String(cur))}`,
    '',
  )
  // Remove & prefix
  if (result.startsWith('&')) {
    result = result.slice(1)
  }
  return result
}
