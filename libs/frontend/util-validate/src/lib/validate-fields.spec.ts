import { checkError } from './validate-fields'

describe('webUtilValidate', () => {
  it('should work', () => {
    expect(checkError('test', '', [])).toEqual(undefined)
  })
})
