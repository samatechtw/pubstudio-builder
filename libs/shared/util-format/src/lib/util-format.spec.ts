import { usdCentsToDollars } from './currency'
import { shorten, strFixed, truncate } from './util-format'

describe('util format tests', () => {
  it.each([
    [100, '$1'],
    [150, '$1.50'],
    [1000, '$10'],
    [1050, '$10.50'],
    [10000, '$100'],
    [100000, '$1,000'],
    [100000000, '$1,000,000'],
  ])('formats %i in currency %s', (amount, expected) => {
    expect(usdCentsToDollars(amount)).toEqual(expected)
  })

  it.each([
    ['', 100, ''],
    ['', 0, ''],
    ['123', 3, '...'],
    ['123', 1, '.'],
    ['short string', 100, 'short string'],
    ['short string', 12, 'short string'],
    ['short string', 11, 'short st...'],
  ])('truncates "%s" to %i correctly', (text, maxLength, expected) => {
    expect(truncate(text, maxLength)).toEqual(expected)
  })

  it.each([
    ['12345678901', 10, '12345678901'],
    ['123', 10, '123'],
    ['0.12345678901', 10, '0.1234567890'],
    ['1.23', 1, '1.2'],
    ['0.1234567890', 10, '0.1234567890'],
  ])('returns "%s" with %i fixed decimal places', (str, n, expected) => {
    expect(strFixed(str, n)).toEqual(expected)
  })

  it.each([
    ['0x1234567890abcdef', 5, 3, '0x123...def'],
    ['', 2, 3, ''],
    ['12345', 3, 3, '12345'],
    ['12345678', 3, 2, '12345678'],
    ['12345678', 2, 2, '12...78'],
  ])(
    'returns "%s" truncated from %i to (len - %i) with ellipses in between',
    (text, fromStart, fromEnd, expected) => {
      expect(shorten(text, fromStart, fromEnd)).toEqual(expected)
    },
  )
})
