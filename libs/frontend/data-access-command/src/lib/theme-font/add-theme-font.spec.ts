import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddThemeFontData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import {
  ISite,
  IThemeFont,
  ThemeFontSource,
  WebSafeFont,
} from '@pubstudio/shared/type-site'
import { applyAddThemeFont, undoAddThemeFont } from './add-theme-font'

describe('Add Theme Font', () => {
  let siteString: string
  let site: ISite
  let font: IThemeFont

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    font = {
      source: ThemeFontSource.Google,
      name: 'Roboto',
      url: 'https://dummyfont.com', // Normally a Google font shouldn't have a URL, it will be ignored
      fallback: WebSafeFont.TimesNewRoman,
    }
  })

  it('should add theme font to site', () => {
    // Assert font with the same key does not exist in site context before adding
    expect(font.name in site.context.theme.fonts).toEqual(false)

    // Add font
    const data = mockAddThemeFontData(font.source, font.name, font.url, font.fallback)
    applyAddThemeFont(site, data)

    // Assert font is added
    expect(site.context.theme.fonts[font.name]).toEqual(font)
  })

  it('should undo add theme font', () => {
    // Add theme font and undo
    const data = mockAddThemeFontData(font.source, font.name, font.url)
    applyAddThemeFont(site, data)
    undoAddThemeFont(site, data)

    // Assert theme font is removed
    expect(font.name in site.context.theme.fonts).toEqual(false)
  })
})
