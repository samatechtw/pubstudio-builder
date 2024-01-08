import { makeSetTranslationsData } from '@pubstudio/frontend/util-command-data'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISite, ISiteContext } from '@pubstudio/shared/type-site'
import { applySetTranslations, undoSetTranslations } from './set-translations'

describe('Set Translations', () => {
  let siteString: string
  let site: ISite
  let context: ISiteContext
  let code: string

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    context = site.context
    code = 'en'
  })

  it('should add a new translation key', () => {
    const newKey = 'test-key'
    const newText = 'Test Test Test'
    // Assert key does not exist
    expect(context.i18n[code][newKey]).toBe(undefined)

    // Set translation
    const data = makeSetTranslationsData(context, code, { [newKey]: newText })
    applySetTranslations(site, data)
    // Assert translation is added
    expect(context.i18n[code][newKey]).toEqual(newText)

    undoSetTranslations(site, data)
    // Assert translation is removed
    expect(context.i18n[code][newKey]).toBe(undefined)
  })

  it('should change an existing translation key', () => {
    const key = 'hello'
    const newText = 'Test Test Test'
    // Assert key does not exist
    expect(context.i18n[code][key]).toEqual('My First Blog')

    // Set translation
    const data = makeSetTranslationsData(context, code, { [key]: newText })
    applySetTranslations(site, data)
    // Assert translation is added
    expect(context.i18n[code][key]).toEqual(newText)

    undoSetTranslations(site, data)
    // Assert translation is removed
    expect(context.i18n[code][key]).toEqual('My First Blog')
  })

  it('should remove a translation key', () => {
    const key = 'hello'
    // Assert key does not exist
    expect(context.i18n[code][key]).toEqual('My First Blog')

    // Set translation
    const data = makeSetTranslationsData(context, code, { [key]: undefined })
    applySetTranslations(site, data)
    // Assert translation is added
    expect(context.i18n[code][key]).toBe(undefined)

    undoSetTranslations(site, data)
    // Assert translation is removed
    expect(context.i18n[code][key]).toEqual('My First Blog')
  })

  it('should add a few keys and modify an existing one', () => {
    const key = 'hello'
    const n1 = 'n1'
    const n2 = 'n2'
    // Assert key does not exist
    expect(context.i18n[code][key]).toEqual('My First Blog')
    expect(context.i18n[code][n1]).toBe(undefined)
    expect(context.i18n[code][n2]).toBe(undefined)

    // Set translation
    const data = makeSetTranslationsData(context, code, {
      [key]: 'New Test',
      [n1]: 'New 1',
      [n2]: 'New 2',
    })
    applySetTranslations(site, data)
    // Assert translation is added
    expect(context.i18n[code][key]).toEqual('New Test')
    expect(context.i18n[code][n1]).toEqual('New 1')
    expect(context.i18n[code][n2]).toEqual('New 2')

    undoSetTranslations(site, data)
    // Assert translation is removed
    expect(context.i18n[code][key]).toEqual('My First Blog')
    expect(context.i18n[code][n1]).toBe(undefined)
    expect(context.i18n[code][n2]).toBe(undefined)
  })

  it('should add keys to a new code', () => {
    code = 'zh-tw'
    const n1 = 'n1'
    const n2 = 'n2'

    // Assert code does not exist
    expect(context.i18n[code]).toBe(undefined)

    // Set translation
    const data = makeSetTranslationsData(context, code, {
      [n1]: 'New 1',
      [n2]: 'New 2',
    })
    applySetTranslations(site, data)
    // Assert translation is added
    expect(context.i18n[code][n1]).toEqual('New 1')
    expect(context.i18n[code][n2]).toEqual('New 2')

    undoSetTranslations(site, data)
    // Assert translation is removed
    expect(context.i18n[code]).toBe(undefined)
  })

  it('should create a new code without adding keys', () => {
    code = 'zh-tw'

    // Assert code does not exist
    expect(context.i18n[code]).toBe(undefined)

    // Set translation
    const data = makeSetTranslationsData(context, code, {})
    applySetTranslations(site, data)
    // Assert code is created
    expect(context.i18n[code]).toEqual({})

    undoSetTranslations(site, data)
    // Assert code is removed
    expect(context.i18n[code]).toBe(undefined)
  })
})
