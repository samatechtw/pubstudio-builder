import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { builtinBehaviors } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { setupMockBehavior } from '@pubstudio/frontend/util-test'
import { mockAddPageData, mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import {
  EditorEventName,
  IEditorContext,
  IPageMetadata,
  ISite,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applyAddPage, undoAddPage } from './add-page'

describe('Add Page', () => {
  let siteString: string
  let site: ISite
  let pageCount: number
  let componentCount: number
  let newPageMetadata: IPageMetadata

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    pageCount = Object.keys(site.pages).length
    componentCount = Object.keys(site.context.components).length
    newPageMetadata = {
      name: 'New Page',
      public: true,
      route: '/new-page',
      head: {},
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should add a new page', () => {
    const data = mockAddPageData(newPageMetadata, site.editor as IEditorContext)

    // Assert page does not exist before add
    expect(site.pages[newPageMetadata.route]).toBeUndefined()

    // Add page
    applyAddPage(site, data)

    // Assert page is added
    const newPage = site.pages[newPageMetadata.route]
    expect(Object.keys(site.pages)).toHaveLength(pageCount + 1)
    expect(newPage).toMatchObject(newPageMetadata)

    // Assert root component is added
    expect(Object.keys(site.context.components)).toHaveLength(componentCount + 1)

    // Assert component tree expand state is added
    expect(site.editor?.componentTreeExpandedItems?.[newPage.root.id]).toEqual(true)
  })

  it('should undo add page', () => {
    const data = mockAddPageData(newPageMetadata, site.editor as IEditorContext)

    // Add page and undo
    applyAddPage(site, data)
    const newPageRootId = site.pages[newPageMetadata.route].root.id
    undoAddPage(site, data)

    // Assert new page does not exist
    expect(Object.keys(site.pages)).toHaveLength(pageCount)
    expect(site.pages[newPageMetadata.route]).toBeUndefined()
    expect(Object.keys(site.context.components)).toHaveLength(componentCount)

    // Assert component tree expand state is removed
    expect(site.editor?.componentTreeExpandedItems?.[newPageRootId]).toBeUndefined()
  })

  it('should have the same root id after redo', () => {
    const data = mockAddPageData(newPageMetadata, site.editor as IEditorContext)

    // Add page, undo, then redo
    applyAddPage(site, data)
    const rootId = site.pages[newPageMetadata.route].root.id
    undoAddPage(site, data)
    applyAddPage(site, data)

    // Assert root id is the same
    expect(site.pages[newPageMetadata.route].root.id).toEqual(rootId)
  })

  it('should create page by copying root', () => {
    const idBefore = site.context.nextId
    const data = mockAddPageData(newPageMetadata, site.editor as IEditorContext)
    const copyCmp = site.pages['/home'].root
    data.root = {
      parentId: '',
      tag: copyCmp.tag,
      content: copyCmp.content,
      sourceId: copyCmp.id,
      name: copyCmp.name,
    }

    // Add page and undo
    applyAddPage(site, data)
    // Assert two components added (root and one child)
    expect(idBefore + 2).toEqual(site.context.nextId)
    expect(site.pages[newPageMetadata.route].root.children?.[0].name).toEqual(
      'ContainerHorizontal',
    )

    const newPageRootId = site.pages[newPageMetadata.route].root.id
    undoAddPage(site, data)

    // Assert new page does not exist
    expect(Object.keys(site.pages)).toHaveLength(pageCount)
    expect(site.pages[newPageMetadata.route]).toBeUndefined()
    expect(Object.keys(site.context.components)).toHaveLength(componentCount)
    expect(idBefore).toEqual(site.context.nextId)

    // Assert component tree expand state is removed
    expect(site.editor?.componentTreeExpandedItems?.[newPageRootId]).toBeUndefined()
  })

  it('should trigger page change editor event', () => {
    const {
      oldBehavior,
      componentData,
      mock: noBehaviorMock,
    } = setupMockBehavior(site, [EditorEventName.OnPageChange])
    applyAddComponent(site, componentData)

    // Add page and assert builtin behavior called
    const data = mockAddPageData(newPageMetadata, site.editor as IEditorContext)
    applyAddPage(site, data)
    expect(noBehaviorMock).toHaveBeenCalledTimes(1)

    // Undo add page and assert behavior is called again
    undoAddPage(site, data)
    expect(noBehaviorMock).toHaveBeenCalledTimes(2)

    // Restore behavior
    builtinBehaviors[noBehaviorId] = oldBehavior
  })
})
