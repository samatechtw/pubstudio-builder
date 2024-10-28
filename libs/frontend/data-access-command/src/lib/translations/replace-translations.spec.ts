import { clone } from '@pubstudio/frontend/util-component'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { IReplaceTranslationsData } from '@pubstudio/shared/type-command-data'
import { ISite, ISiteContext } from '@pubstudio/shared/type-site'
import { applyReplaceTranslations, undoReplaceTranslations } from './replace-translations'

describe('Replace Translations', () => {
  let siteString: string
  let site: ISite
  let context: ISiteContext

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    context = site.context
  })

  it('should replace translations and undo', () => {
    const newTranslations = {
      en: { test: 'hello', key2: 'hello again' },
      vi: { test: 'xin chào' },
    }
    const oldTranslations = clone(site.context.i18n)

    // Replace translation
    const data: IReplaceTranslationsData = { oldTranslations, newTranslations }
    applyReplaceTranslations(site, data)
    // Assert translation is added
    expect(context.i18n).toEqual(newTranslations)

    undoReplaceTranslations(site, data)
    // Assert translations are set to original version
    expect(context.i18n).toEqual(oldTranslations)
  })
})
