import { setActivePage, setSelectedComponent } from '@pubstudio/frontend/feature-editor'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddPageData,
  mockChangePageData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IEditorContext, IPageMetadata, ISite } from '@pubstudio/shared/type-site'
import { applyAddPage } from './add-page'
import { applyChangePage, undoChangePage } from './change-page'

describe('Change Page', () => {
  let siteString: string
  let site: ISite
  let newPageRoute: string

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    const defaultPageRoute = Object.keys(site.pages)[0]
    newPageRoute = '/new-page'

    // Add page
    const newPageMetadata: IPageMetadata = {
      name: 'New Page',
      public: true,
      route: newPageRoute,
      head: {},
    }
    const addPageData = mockAddPageData(newPageMetadata, site.editor as IEditorContext)
    applyAddPage(site, addPageData)
    setActivePage(site.editor, defaultPageRoute)
  })

  it('should change page', () => {
    const pageBefore = site.editor?.active as string
    expect(pageBefore).not.toEqual(newPageRoute)

    // Select a component
    const pageRoot = site.pages[pageBefore].root
    setSelectedComponent(site, pageRoot)

    // Change page
    const data = mockChangePageData(
      pageBefore,
      newPageRoute,
      site.editor?.selectedComponent?.id,
    )
    applyChangePage(site, data)

    // Assert active page is changed
    expect(site.editor?.active).toEqual(newPageRoute)
    // Assert component is deselected
    expect(site.editor?.selectedComponent?.id).toBeUndefined()
  })

  it('should undo change page', () => {
    const pageBefore = site.editor?.active as string
    expect(pageBefore).not.toEqual(newPageRoute)

    // Select a component
    const pageRoot = site.pages[pageBefore].root
    setSelectedComponent(site, pageRoot)

    // Change page and undo
    const data = mockChangePageData(
      pageBefore,
      newPageRoute,
      site.editor?.selectedComponent?.id,
    )
    applyChangePage(site, data)
    undoChangePage(site, data)

    // Assert active page is not changed
    expect(site.editor?.active).toEqual(pageBefore)
    // Assert component is still selected
    expect(site.editor?.selectedComponent).toEqual(pageRoot)
  })
})
