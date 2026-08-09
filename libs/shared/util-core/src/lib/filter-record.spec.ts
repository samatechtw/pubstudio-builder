import { filterRecord } from './filter-record'

describe('filterRecord', () => {
  it('keeps only entries matching the predicate', () => {
    const record = { a: 1, b: 2, c: 3, d: 4 }
    expect(filterRecord(record, (value) => value % 2 === 0)).toEqual({ b: 2, d: 4 })
  })

  it('passes the key to the predicate', () => {
    const record = { keep1: 'a', drop: 'b', keep2: 'c' }
    expect(filterRecord(record, (_value, key) => key.startsWith('keep'))).toEqual({
      keep1: 'a',
      keep2: 'c',
    })
  })

  it('returns an empty record when nothing matches', () => {
    expect(filterRecord({ a: 1 }, () => false)).toEqual({})
  })

  it('does not modify the source record', () => {
    const record = { a: 1, b: 2 }
    const result = filterRecord(record, (value) => value === 1)
    result.c = 3
    expect(record).toEqual({ a: 1, b: 2 })
  })
})
