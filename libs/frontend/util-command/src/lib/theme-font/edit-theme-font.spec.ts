import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddThemeFontData,
  mockEditThemeFontData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import {
  ISite,
  IThemeFont,
  ThemeFontSource,
  WebSafeFont,
} from '@pubstudio/shared/type-site'
import { applyAddThemeFont } from './add-theme-font'
import { applyEditThemeFont, undoEditThemeFont } from './edit-theme-font'

describe('Edit Theme Font', () => {
  let siteString: string
  let site: ISite
  let oldFont: IThemeFont
  let newFont: IThemeFont

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Prepare old theme font
    oldFont = {
      source: ThemeFontSource.Native,
      name: WebSafeFont.Garamond,
    }
    newFont = {
      source: ThemeFontSource.Google,
      name: 'Lato',
      fallback: WebSafeFont.Arial,
    }

    const addFontData = mockAddThemeFontData(
      oldFont.source,
      oldFont.name,
      oldFont.fallback,
    )
    applyAddThemeFont(site, addFontData)
  })

  it('should edit theme font in site', () => {
    // Edit theme font
    const data = mockEditThemeFontData(oldFont, newFont)
    applyEditThemeFont(site, data)

    // Assert theme font is edited
    expect(Object.keys(site.context.theme.fonts)).toHaveLength(1)
    expect(site.context.theme.fonts[newFont.name]).toEqual(newFont)
  })

  it('should undo edit theme font', () => {
    // Edit theme font and undo
    const data = mockEditThemeFontData(oldFont, newFont)
    applyEditThemeFont(site, data)
    undoEditThemeFont(site, data)

    // Assert theme font is reverted
    expect(site.context.theme.fonts[oldFont.name]).toEqual(oldFont)
  })
})
