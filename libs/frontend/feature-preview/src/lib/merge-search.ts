/**
 * searchB will take precedence over searchA.
 */
export const mergeSearch = (searchA: string, searchB: string): URLSearchParams => {
  const urlA = new URL(`https://tmp${searchA}`)
  const urlB = new URL(`https://tmp${searchB}`)

  const params = new URLSearchParams(urlA.search)
  const entriesB = Array.from(new URLSearchParams(urlB.search).entries())

  for (const [key, value] of entriesB) {
    params.append(key, value)
  }

  return params
}
