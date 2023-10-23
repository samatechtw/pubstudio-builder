import { validateBillingName } from './validate-billing-name'

describe('validate billing name', () => {
  it('should return true for valid names', () => {
    expect(validateBillingName('I like cake')).toEqual(true)
    expect(validateBillingName('ILIKECAKE')).toEqual(true)
    expect(validateBillingName('我喜歡蛋糕')).toEqual(true) // traditional Chinese
    expect(validateBillingName('厂广叶适')).toEqual(true) // simplified Chinese
    expect(validateBillingName('I like 蛋糕')).toEqual(true)
    expect(validateBillingName('I 喜歡 cake')).toEqual(true)
    expect(validateBillingName('I,l.i(k)e/蛋-糕')).toEqual(true)
    expect(validateBillingName(',.()/- ')).toEqual(true)
  })

  it('should return false for invalid names', () => {
    expect(validateBillingName('I like 🍰')).toEqual(false)
    expect(validateBillingName("J'aime le gâteau")).toEqual(false)
    expect(validateBillingName('I laiku ケーキ desu')).toEqual(false)
    expect(validateBillingName('I l!ke cake')).toEqual(false)
    expect(validateBillingName('I like c@ke')).toEqual(false)
    expect(validateBillingName('!@#$%^&*')).toEqual(false)
  })
})
