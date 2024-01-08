import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { serializePage, stringifySite } from '@pubstudio/frontend/util-site-store'
import { setupMockBehavior } from '@pubstudio/frontend/util-test'
import {
  mockAddPageData,
  mockRemovePageData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { EditorEventName, IEditorContext, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applyAddPage } from './add-page'
import { applyRemovePage, undoRemovePage } from './remove-page'

describe('Remove Page', () => {
  let siteString: string
  let site: ISite
  let pageToBeRemoved: string
  let pageCount: number
  let componentCount: number

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Add page to be removed
    pageToBeRemoved = '/new-page'
    const addPageData = mockAddPageData(
      {
        name: 'New Page',
        public: true,
        route: pageToBeRemoved,
        head: {},
      },
      site.editor as IEditorContext,
    )
    applyAddPage(site, addPageData)

    pageCount = Object.keys(site.pages).length
    componentCount = Object.keys(site.context.components).length
  })

  it('should remove page', () => {
    // Assert page exists before removing
    const removedPage = site.pages[pageToBeRemoved]
    expect(removedPage).not.toBeUndefined()
    expect(site.context.components[removedPage.root.id]).not.toBeUndefined()

    // Remove page
    const data = mockRemovePageData(
      pageToBeRemoved,
      serializePage(removedPage),
      site.editor?.selectedComponent?.id,
    )
    applyRemovePage(site, data)

    // Assert page is removed
    expect(site.pages[pageToBeRemoved]).toBeUndefined()
    expect(Object.keys(site.pages)).toHaveLength(pageCount - 1)

    // Manually serialize/deserialize site, to mimic saving/restoring from local storage
    const newSite = deserializeSite(stringifySite(site)) as ISite
    // Assert root component is removed
    expect(newSite.context.components[removedPage.root.id]).toBeUndefined()
    expect(Object.keys(newSite.context.components)).toHaveLength(componentCount - 1)
  })

  it('should undo remove page', () => {
    const removedPage = site.pages[pageToBeRemoved]

    // Remove page and undo
    const data = mockRemovePageData(
      pageToBeRemoved,
      serializePage(removedPage),
      site.editor?.selectedComponent?.id,
    )
    applyRemovePage(site, data)
    undoRemovePage(site, data)

    // Assert page exists
    expect(Object.keys(site.pages)).toHaveLength(pageCount)
    expect(site.pages[pageToBeRemoved]).toMatchObject(removedPage)

    // Assert root component exists
    expect(Object.keys(site.context.components)).toHaveLength(componentCount)
    expect(site.context.components[removedPage.root.id]).toMatchObject(removedPage.root)
  })

  it('should trigger page change editor event', () => {
    const {
      oldBehavior,
      componentData,
      mock: noBehaviorMock,
    } = setupMockBehavior(site, [EditorEventName.OnPageChange])
    applyAddComponent(site, componentData)

    const removedPage = site.pages[pageToBeRemoved]

    // Remove page and assert builtin behavior called
    const data = mockRemovePageData(
      pageToBeRemoved,
      serializePage(removedPage),
      site.editor?.selectedComponent?.id,
    )
    applyRemovePage(site, data)
    expect(noBehaviorMock).toHaveBeenCalledTimes(1)

    // Undo remove page and assert behavior is called again
    undoRemovePage(site, data)
    expect(noBehaviorMock).toHaveBeenCalledTimes(2)

    // Restore behavior
    builtinBehaviors[noBehaviorId] = oldBehavior
  })
})
