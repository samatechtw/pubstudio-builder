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
    it('convert string to date', () => {
      const dateStr = '2021-10-10T17:00:00-03:00'
      const date = new Date(dateStr)
      expect(date.getFullYear()).toEqual(2021)
      expect(date.getMonth()).toEqual(10 - 1)
      // This test case might fail in local environment because it's effeced by the machine's timezone setting.
      // In the CI environment, the timezone is fixed at UTC+0, so the `getDate()` for 2021-10-10T17:00:00-03:00
      // is expected to be 10. However, in a local environment where the timezone may differ, for example, in
      // the UTC+8 timezone, the `getDate()` of the same date object would return 11 instead of 10 because
      // 2021-10-10T17:00:00-03:00 is equivalent to 2021-10-10T20:00:00 in the UTC+0 timezone, and further
      // translates to 2021-10-11T04:00:00 in the UTC+8 timezone.
      expect(date.getDate()).toEqual(10)
    })

    it('convert to and from UTC', () => {
      const dateStr = '2021-10-10T08:00:00+00:00'
      expect(date2str(new Date(dateStr), 'UTC')).toEqual(dateStr)
    })
  })
})
