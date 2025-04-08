import { computePathRegex } from './router-util'

describe('Router util - ', () => {
  describe('compute path regexes', () => {
    it('should match the root/empty path', () => {
      const regex = computePathRegex('/')

      expect(regex.test('/')).toBe(true)
      expect(regex.test('/?test=123')).toBe(true)
      expect(regex.test('/#test')).toBe(true)
      expect(regex.test('/?test=123#test')).toBe(true)

      expect(regex.test('/test')).toBe(false)
      expect(regex.test('/test/')).toBe(false)
    })

    it('should match path with single part', () => {
      const regex = computePathRegex('/test')

      expect(regex.test('/')).toBe(false)
      expect(regex.test('/?test=123')).toBe(false)
      expect(regex.test('/#test')).toBe(false)
      expect(regex.test('/?test=123#test')).toBe(false)
      expect(regex.test('/test/anotherpart')).toBe(false)
      expect(regex.test('/test/anotherpart?123')).toBe(false)

      expect(regex.test('/test')).toBe(true)
      expect(regex.test('/test?test=123')).toBe(true)
      expect(regex.test('/test?test=123&test2=1234')).toBe(true)
      expect(regex.test('/test?test=1&test2=2#3')).toBe(true)
      expect(regex.test('/test#123')).toBe(true)
      expect(regex.test('/test/')).toBe(true)
      expect(regex.test('/test/?test=123')).toBe(true)
      expect(regex.test('/test/#123')).toBe(true)
    })

    it('should match path with single path variable', () => {
      const regex = computePathRegex('/:id')

      expect(regex.test('/')).toBe(false)
      expect(regex.test('/?test=123')).toBe(false)
      expect(regex.test('/#test')).toBe(false)
      expect(regex.test('/?test=123#test')).toBe(false)

      expect(regex.test('/test')).toBe(true)
      expect(regex.test('/test?test=123')).toBe(true)
      expect(regex.test('/test#123')).toBe(true)
      expect(regex.test('/test/')).toBe(true)
      expect(regex.test('/test/?test=123')).toBe(true)
      expect(regex.test('/test/#123')).toBe(true)
    })

    it('should match path with multiple parts', () => {
      const regex = computePathRegex('/test/part')

      expect(regex.test('/test')).toBe(false)
      expect(regex.test('/test/')).toBe(false)
      expect(regex.test('/test/anotherpart')).toBe(false)
      expect(regex.test('/test/anotherpart?123')).toBe(false)
      expect(regex.test('/test?test=123')).toBe(false)
      expect(regex.test('/#test')).toBe(false)
      expect(regex.test('/?test=123#test')).toBe(false)

      expect(regex.test('/test/part')).toBe(true)
      expect(regex.test('/test/part?test=123')).toBe(true)
      expect(regex.test('/test/part#123')).toBe(true)
      expect(regex.test('/test/part/')).toBe(true)
      expect(regex.test('/test/part/?test=123')).toBe(true)
      expect(regex.test('/test/part/#123')).toBe(true)
    })

    it('should match glob path', () => {
      const regex = computePathRegex('/test/:pathMatch*')

      // Glob is handled outside the regex matcher,
      // so it should be treated as a regular multipart path
      expect(regex.test('/test')).toBe(false)
      expect(regex.test('/test?test=123')).toBe(false)
      expect(regex.test('/#test')).toBe(false)
      expect(regex.test('/?test=123#test')).toBe(false)

      expect(regex.test('/test/')).toBe(true)
      expect(regex.test('/test/part')).toBe(true)
      expect(regex.test('/test/part?test=123')).toBe(true)
      expect(regex.test('/test/part#123')).toBe(true)
      expect(regex.test('/test/part/')).toBe(true)
      expect(regex.test('/test/part/?test=123')).toBe(true)
      expect(regex.test('/test/part/#123')).toBe(true)
    })
  })
})
