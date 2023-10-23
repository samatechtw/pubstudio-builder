import { expect } from '@jest/globals'
import { uidSingleton } from './uid'

describe('form uid generator', () => {
  it('should increment', () => {
    expect(uidSingleton.next()).toEqual(1)
    expect(uidSingleton.next()).toEqual(2)
  })
})
