import { parseSides, serializeSides } from './parse-css'

describe('Parse CSS', () => {
  describe('Parse padding/margin sides', () => {
    it('returns empty array for invalid values', () => {
      expect(parseSides(undefined)).toEqual([0, 0, 0, 0])
      expect(parseSides('')).toEqual([0, 0, 0, 0])
      expect(parseSides('1 2 3 4 5')).toEqual([0, 0, 0, 0])
      expect(parseSides('a b c')).toEqual([0, 0, 0, 0])
    })

    it('returns array for single value', () => {
      expect(parseSides('10px')).toEqual([10, 10, 10, 10])
      expect(parseSides('10%')).toEqual([10, 10, 10, 10])
      expect(parseSides('0')).toEqual([0, 0, 0, 0])
      expect(parseSides('auto')).toEqual(['auto', 'auto', 'auto', 'auto'])
    })

    it('returns array for two values', () => {
      expect(parseSides('10px 5%')).toEqual([10, 5, 10, 5])
      expect(parseSides('0 20px')).toEqual([0, 20, 0, 20])
    })

    it('returns array for three values', () => {
      expect(parseSides('1px 2px 3px')).toEqual([1, 2, 3, 2])
    })

    it('returns array for four values', () => {
      expect(parseSides('1px 2px 3px 4px')).toEqual([1, 2, 3, 4])
      expect(parseSides('auto 0 unset 1px')).toEqual(['auto', 0, 'unset', 1])
    })
  })

  describe('Serialize padding/margin sides', () => {
    it('returns serialized value', () => {
      expect(serializeSides([0, 1, 2, 3])).toEqual('0px 1px 2px 3px')
      expect(serializeSides([10, 'auto', 'unset', 10])).toEqual('10px auto unset 10px')
    })
  })
})
