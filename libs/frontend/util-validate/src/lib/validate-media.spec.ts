import { validateMedia } from './validate-media'

describe('webUtilValidate', () => {
  it('should work', () => {
    expect(typeof validateMedia).toEqual('function')
  })
})
