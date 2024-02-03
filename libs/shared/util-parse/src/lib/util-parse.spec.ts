import { date2str, str2bool } from './util-parse'

describe('sharedUtilParse', () => {
  describe('parse string to bool', () => {
    it('returns true for "true"', () => {
      expect(str2bool('true')).toEqual(true)
    })

    it('returns false for "false"', () => {
      expect(str2bool('false')).toEqual(false)
    })

    it('returns undefined for non-boolean strings', () => {
      expect(str2bool('asdfasdfasd')).toEqual(undefined)
    })
  })

  describe('parse dates', () => {
    it.each([
      ['2021-10-10T08:00:00+00:00'],
      ['2021-10-10T02:00:00+00:00'],
      ['2021-10-10T22:01:22+00:00'],
      ['2024-02-28T22:00:00+00:00'],
      ['2024-03-01T00:00:00+00:00'],
    ])('convert to and from UTC', (dateStr) => {
      expect(date2str(new Date(dateStr), true)).toEqual(dateStr)
    })
  })
})
