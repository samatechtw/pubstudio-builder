import { normalizeTagName } from './normalize-tag-name'

describe('normalizeTagName()', () => {
  it('returns empty string when give an empty string', () => {
    expect(normalizeTagName('')).toEqual('')
  })

  it('lowercases all letters', () => {
    expect(normalizeTagName('SaMpLeTag')).toEqual('sampletag')
  })

  it('replaces all spaces with _', () => {
    expect(normalizeTagName('some sample tag')).toEqual('some_sample_tag')
  })
})
