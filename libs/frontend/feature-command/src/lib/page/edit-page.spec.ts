import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { IEditPageData } from '@pubstudio/shared/type-command-data'
import { EditorEventName, IPageMetadata, ISite } from '@pubstudio/shared/type-site'
import { setupMockBehavior } from '@pubstudio/web/util-test'
import { mockEditPageData, mockSerializedSite } from '@pubstudio/web/util-test-mock'
import { applyAddComponent } from '../component/add-component'
import { applyEditPage, undoEditPage } from './edit-page'

describe('Edit Page', () => {
  let siteString: string
  let site: ISite
  let pageCount: number
  let componentCount: number
  let pageToBeEdited: string

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    pageCount = Object.keys(site.pages).length
    componentCount = Object.keys(site.context.components).length
    pageToBeEdited = Object.keys(site.pages)[0]
  })

  describe('should edit a page', () => {
    it('edits when not changing page route', () => {
      const pageBefore = site.pages[pageToBeEdited]
      const root = pageBefore.root
      const newMetadata: IPageMetadata = {
        name: `${pageBefore.name}-new`,
        public: !pageBefore.public,
        route: pageBefore.route,
        head: {},
      }
      const data = mockEditPageData(site, pageToBeEdited, newMetadata)

      // Edit page
      applyEditPage(site, data)

      // Assert no page is added
      expect(Object.keys(site.pages)).toHaveLength(pageCount)
      // Assert no new component is added
      expect(Object.keys(site.context.components)).toHaveLength(componentCount)
      // Assert page is updated
      expect(site.pages[pageToBeEdited]).toMatchObject({
        ...newMetadata,
        root,
      })
    })

    it('edits when changing page route', () => {
      const pageBefore = site.pages[pageToBeEdited]
      const root = pageBefore.root
      const newMetadata: IPageMetadata = {
        name: `${pageBefore.name}_new`,
        public: !pageBefore.public,
        route: `${pageBefore.route}-new`,
        head: {},
      }
      const data = mockEditPageData(site, pageToBeEdited, newMetadata)

      // Edit page
      applyEditPage(site, data)

      // Assert old key is removed
      expect(site.pages[pageBefore.route]).toBeUndefined()
      // Assert no new page is added
      expect(Object.keys(site.pages)).toHaveLength(pageCount)
      // Assert no new component is added
      expect(Object.keys(site.context.components)).toHaveLength(componentCount)
      // Assert page is renamed and updated
      expect(site.pages[newMetadata.route]).toMatchObject({
        ...newMetadata,
        root,
      })
    })

    it('updates home page in site defaults when changing home page route', () => {
      // Assert target page is the home page before editing
      const pageBefore = site.pages[pageToBeEdited]
      expect(site.defaults.homePage).toEqual(pageToBeEdited)

      // Edit page
      const newMetadata: IPageMetadata = {
        name: `${pageBefore.name}_new`,
        public: !pageBefore.public,
        route: `/${pageBefore}-new`,
        head: {},
      }
      const data = mockEditPageData(site, pageToBeEdited, newMetadata)
      applyEditPage(site, data)

      // Assert site defaults is updated
      expect(site.defaults.homePage).toEqual(newMetadata.route)
    })
  })

  it('should revert home page to previous value when edit page is undone', () => {
    // Assert target page is the home page before editing
    const pageBefore = site.pages[pageToBeEdited]
    expect(site.defaults.homePage).toEqual(pageToBeEdited)

    // Edit page and undo
    const newMetadata: IPageMetadata = {
      name: `${pageBefore.name}_new`,
      public: !pageBefore.public,
      route: `/${pageBefore}-new`,
      head: {},
    }
    const data = mockEditPageData(site, pageToBeEdited, newMetadata)
    applyEditPage(site, data)
    undoEditPage(site, data)

    // Assert home page is reverted back to previous value
    expect(site.defaults.homePage).toEqual(pageToBeEdited)
  })

  describe('edits page with undo', () => {
    let pageMetadataBefore: IPageMetadata
    let newMetadata: IPageMetadata
    let editData: IEditPageData

    beforeEach(() => {
      const pageBefore = site.pages[pageToBeEdited]
      pageMetadataBefore = {
        name: pageBefore.name,
        public: pageBefore.public,
        route: pageBefore.route,
        head: pageBefore.head,
      }
      newMetadata = {
        name: pageToBeEdited,
        public: !pageMetadataBefore.public,
        route: `${pageMetadataBefore.route}-new`,
        head: {},
      }
      editData = mockEditPageData(site, pageToBeEdited, newMetadata)
    })

    it('should undo edit page', () => {
      // Edit page and undo
      applyEditPage(site, editData)
      undoEditPage(site, editData)

      // Assert page is not updated
      expect(site.pages[pageToBeEdited]).toMatchObject(pageMetadataBefore)
      expect(Object.keys(site.pages)).toHaveLength(pageCount)
      expect(Object.keys(site.context.components)).toHaveLength(componentCount)
    })

    it('should trigger page change editor event', () => {
      const {
        oldBehavior,
        componentData,
        mock: noBehaviorMock,
      } = setupMockBehavior(site, [EditorEventName.OnPageChange])
      applyAddComponent(site, componentData)

      // Edit page and assert builtin behavior called
      applyEditPage(site, editData)
      expect(noBehaviorMock).toHaveBeenCalledTimes(1)

      // Undo edit page and assert behavior is called again
      undoEditPage(site, editData)
      expect(noBehaviorMock).toHaveBeenCalledTimes(2)

      // Restore behavior
      builtinBehaviors[noBehaviorId] = oldBehavior
    })
  })
})
