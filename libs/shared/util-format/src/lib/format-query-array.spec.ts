import { arrayToQuery } from './format-query-array'

describe('util format tests', () => {
  it('formats empty array', () => {
    expect(arrayToQuery('test', [])).toEqual('')
  })

  it('formats array of numbers', () => {
    const numArray = [1, 2, 3]
    expect(arrayToQuery('num', numArray)).toEqual('num=1&num=2&num=3')
  })

  it('formats array of strings', () => {
    const stringArray = ['test1', 'test2', 'test3']
    expect(arrayToQuery('arr', stringArray)).toEqual('arr=test1&arr=test2&arr=test3')
  })
})
