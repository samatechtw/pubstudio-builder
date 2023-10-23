import { formatUsd, usdCentsToDollars, usdToCents } from './currency'

describe('currency', () => {
  describe('usdToCents', () => {
    it.each([
      ['0.00000000', 0],
      ['300.00000000', 30000],
      ['300.99000000', 30099],
      ['1.01', 101],
      ['10.001', 1000],
      ['$199.99', 19999],
    ])('converts %i dollars to %s cents', (amount, expected) => {
      expect(usdToCents(amount)).toEqual(expected)
    })
  })

  describe('usdCentsToDollars', () => {
    it.each([
      [0, '$0'],
      [10, '$0.10'],
      [100, '$1'],
      [1000, '$10'],
      [1000000, '$10,000'],
    ])('converts %i cents to %s dollars', (cents, expected) => {
      expect(usdCentsToDollars(cents)).toEqual(expected)
    })
  })

  describe('formatUsd', () => {
    it.each([
      [0, false, '$0'],
      [0, true, '$0.00'],
      [10, false, '$10'],
      [100, true, '$100.00'],
      [100.5, true, '$100.50'],
      [1000.75, false, '$1,000.75'],
      [1000000.2, false, '$1,000,000.20'],
    ])(
      `converts %i cents (show zero cents: %s) %s dollars`,
      (cents, showZeroCents, expected) => {
        expect(formatUsd(cents, showZeroCents)).toEqual(expected)
      },
    )
  })
})
