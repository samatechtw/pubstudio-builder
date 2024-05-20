import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { builtinBehaviors } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { setupMockBehavior } from '@pubstudio/frontend/util-test'
import {
  mockAddPageData,
  mockSerializedSite,
  mockSetHomePageData,
} from '@pubstudio/frontend/util-test-mock'
import {
  EditorEventName,
  IEditorContext,
  IPageMetadata,
  ISite,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applyAddPage } from './add-page'
import { applySetHomePage, undoSetHomePage } from './set-home-page'

describe('Set Home Page', () => {
  let siteString: string
  let site: ISite
  let newHomePageRoute: string
  let prevHomePage: string

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    newHomePageRoute = '/new-home-page'
    const newHomePageMetadata: IPageMetadata = {
      name: 'New Home Page',
      route: newHomePageRoute,
      public: true,
      head: {},
    }
    const addPageData = mockAddPageData(
      newHomePageMetadata,
      site.editor as IEditorContext,
    )
    applyAddPage(site, addPageData)
    prevHomePage = site.defaults.homePage
  })

  describe('set home page', () => {
    it('should set home page', () => {
      // Set home page
      const data = mockSetHomePageData(prevHomePage, newHomePageRoute)
      applySetHomePage(site, data)

      // Assert home page is updated
      expect(site.defaults.homePage).toEqual(newHomePageRoute)
    })

    it('should throw an error when new page does not exist', () => {
      const nonExistingPageRoute = 'Non Existing Page'

      const data = mockSetHomePageData(prevHomePage, nonExistingPageRoute)
      const setHomePage = () => applySetHomePage(site, data)

      expect(setHomePage).toThrowError(
        `Cannot find page with route ${nonExistingPageRoute}`,
      )
    })
  })

  describe('undo set home page', () => {
    it('should undo set home page', () => {
      // Set home page and undo
      const data = mockSetHomePageData(prevHomePage, newHomePageRoute)
      applySetHomePage(site, data)
      undoSetHomePage(site, data)

      // Assert home page is reverted back to previous value
      expect(site.defaults.homePage).toEqual(prevHomePage)
    })

    it('should throw an error when old page does not exist', () => {
      const nonExistingPageRoute = '/some/route'

      // Set home page and undo
      const setHomePageData = mockSetHomePageData(prevHomePage, newHomePageRoute)
      applySetHomePage(site, setHomePageData)

      const incorrectSetHomePageData = mockSetHomePageData(
        nonExistingPageRoute,
        newHomePageRoute,
      )
      const undo = () => undoSetHomePage(site, incorrectSetHomePageData)

      // Assert home page is reverted back to previous value
      expect(undo).toThrowError(`Cannot find page with route ${nonExistingPageRoute}`)
    })
  })

  it('should trigger page change editor event', () => {
    const {
      oldBehavior,
      componentData,
      mock: noBehaviorMock,
    } = setupMockBehavior(site, [EditorEventName.OnPageChange])
    applyAddComponent(site, componentData)

    // Set home page and assert builtin behavior called
    const data = mockSetHomePageData(prevHomePage, newHomePageRoute)
    applySetHomePage(site, data)
    expect(noBehaviorMock).toHaveBeenCalledTimes(1)

    // Undo set home page and assert behavior is called again
    undoSetHomePage(site, data)
    expect(noBehaviorMock).toHaveBeenCalledTimes(2)

    // Restore behavior
    builtinBehaviors[noBehaviorId] = oldBehavior
  })
})
