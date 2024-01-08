import { mergeSearch } from './merge-search'

describe('merge search params', () => {
  it('should work', () => {
    const searchA = '?a=b&c=d&e=f#test-c-1'
    const searchB = '?a=x&a=y&b=z&p=q#test-c-2'
    const mergedSearch = mergeSearch(searchA, searchB)

    // `URLSearchParams.size` is only supported for Node v19.0.0 and later, so `keys()` is used here.
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/size#browser_compatibility
    expect(Array.from(mergedSearch.keys())).toHaveLength(7)
    expect(mergedSearch.getAll('a')).toEqual(['b', 'x', 'y'])
    expect(mergedSearch.getAll('c')).toEqual(['d'])
    expect(mergedSearch.getAll('e')).toEqual(['f'])
    expect(mergedSearch.getAll('b')).toEqual(['z'])
    expect(mergedSearch.getAll('p')).toEqual(['q'])
  })
})
