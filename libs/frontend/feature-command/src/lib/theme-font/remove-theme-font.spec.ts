import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddThemeFontData,
  mockRemoveThemeFontData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import {
  ISite,
  IThemeFont,
  ThemeFontSource,
  WebSafeFont,
} from '@pubstudio/shared/type-site'
import { applyAddThemeFont } from './add-theme-font'
import { applyRemoveThemeFont, undoRemoveThemeFont } from './remove-theme-font'

describe('Remove Theme Font', () => {
  let siteString: string
  let site: ISite
  let fontToBeRemoved: IThemeFont

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    fontToBeRemoved = {
      source: ThemeFontSource.Native,
      name: WebSafeFont.Verdana,
    }

    const addFontData = mockAddThemeFontData(
      fontToBeRemoved.source,
      fontToBeRemoved.name,
      fontToBeRemoved.fallback,
    )
    applyAddThemeFont(site, addFontData)
  })

  it('should remove theme font in site', () => {
    // Assert theme font exists before removing
    expect(fontToBeRemoved.name in site.context.theme.fonts).toEqual(true)

    // Remove theme font
    const data = mockRemoveThemeFontData(fontToBeRemoved)
    applyRemoveThemeFont(site, data)

    // Assert theme font is removed
    expect(fontToBeRemoved.name in site.context.theme.fonts).toEqual(false)
  })

  it('should undo remove theme font', () => {
    // Remove theme font and undo
    const data = mockRemoveThemeFontData(fontToBeRemoved)
    applyRemoveThemeFont(site, data)
    undoRemoveThemeFont(site, data)

    // Assert theme font is removed
    expect(site.context.theme.fonts[fontToBeRemoved.name]).toEqual(fontToBeRemoved)
  })
})
