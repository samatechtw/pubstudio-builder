import { flexDefaults, parseFlex } from './parse-flex'

describe('parseFlex', () => {
  it.each([
    [undefined, flexDefaults],
    ['2', { ...flexDefaults, grow: '2' }],
    ['10em', { ...flexDefaults, basis: '10em' }],
    ['30%', { ...flexDefaults, basis: '30%' }],
    ['min-content', { ...flexDefaults, basis: 'min-content' }],
    ['1 30px', { ...flexDefaults, grow: '1', basis: '30px' }],
    ['2 2', { ...flexDefaults, grow: '2', shrink: '2' }],
    ['2 2 10%', { grow: '2', shrink: '2', basis: '10%' }],
  ])('parses valid flex values', (amount, expected) => {
    expect(parseFlex(amount)).toEqual(expected)
  })
})
