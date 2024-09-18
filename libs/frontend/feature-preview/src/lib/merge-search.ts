export const pathToSearchParams = (path: string): URLSearchParams => {
  const url = new URL(`https://tmp${path}`)
  return new URLSearchParams(url.search)
}

/**
 * searchB will take precedence over searchA.
 */
export const mergeSearch = (searchA: string, searchB: string): URLSearchParams => {
  const params = pathToSearchParams(searchA)
  const entriesB = Array.from(pathToSearchParams(searchB).entries())

  for (const [key, value] of entriesB) {
    params.append(key, value)
  }

  return params
}
