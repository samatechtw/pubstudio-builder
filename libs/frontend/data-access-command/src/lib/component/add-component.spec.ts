import { DEFAULT_BREAKPOINT_ID, noBehaviorId } from '@pubstudio/frontend/util-ids'
import { builtinBehaviors, resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { serializeComponent, stringifySite } from '@pubstudio/frontend/util-site-store'
import {
  addComponentDataWithSelected,
  expectSiteWithoutComponentTree,
  setupMockBehavior,
} from '@pubstudio/frontend/util-test'
import {
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import {
  EditorEventName,
  IBreakpoint,
  IComponent,
  IComponentEditorEvents,
  IEditorEvent,
  ISerializedComponent,
  ISite,
} from '@pubstudio/shared/type-site'
import { applyAddComponent, undoAddComponent } from './add-component'

jest.mock('@pubstudio/frontend/util-runtime', () => {
  // We can't use ref or computed here because Vue instance is not initialized here
  const activeBreakpoint: IBreakpoint = {
    id: DEFAULT_BREAKPOINT_ID,
    name: 'Desktop (default)',
  }
  return {
    ...jest.requireActual('@pubstudio/frontend/util-runtime'),
    activeBreakpoint: {
      value: activeBreakpoint,
    },
  }
})

describe('Add Component', () => {
  let siteString: string
  let site: ISite
  let componentCount: number

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    componentCount = Object.keys(site.context.components).length
  })

  it('should add component with no children content', () => {
    const newCmp = mockSerializedComponent(site)

    const data = addComponentDataWithSelected(newCmp, site.editor)
    applyAddComponent(site, data)
    const addedCmp = site.pages['/home']?.root.children?.[0]?.children?.[0]
    const newComponentCount = Object.keys(site.context.components).length

    expect(addedCmp).toBeDefined()
    expect(newComponentCount).toEqual(componentCount + 1)
    expect(serializeComponent(addedCmp as IComponent)).toEqual(newCmp)
  })

  it('should undo add-component with no `is`, children, or content', () => {
    const newCmp = mockSerializedComponent(site)

    const data = addComponentDataWithSelected(newCmp, site.editor)
    applyAddComponent(site, data)
    undoAddComponent(site, data)

    const newComponentCount = Object.keys(site.context.components).length

    expect(newComponentCount).toEqual(componentCount)
    // Stringify and parse site to clear undefined keys
    expectSiteWithoutComponentTree(site, mockSerializedSite)
  })

  describe('with `is`/children', () => {
    let siteCheckpoint: string

    beforeEach(() => {
      // Add two children to component
      const childData = addComponentDataWithSelected(
        mockSerializedComponent(site),
        site.editor,
      )
      applyAddComponent(site, childData)
      applyAddComponent(site, childData)
      // Save the state to compare later
      siteCheckpoint = stringifySite(site)
      componentCount = Object.keys(site.context.components).length
    })

    it('should add component and merge with source', () => {
      // Add component with `is` to root
      const is = 'test-c-1'
      const newCmp = mockSerializedComponent(site, {
        parentId: 'test-c-0',
        style: { custom: {} },
      })

      const data = addComponentDataWithSelected(newCmp, site.editor, is)
      applyAddComponent(site, data)

      const sourceCmp = resolveComponent(site.context, is)
      let serializedSource = serializeComponent(sourceCmp as ISerializedComponent)
      const addedCmp = site.pages['/home']?.root.children?.[1]
      let newComponentCount = Object.keys(site.context.components).length

      expect(addedCmp).toBeDefined()
      const expectedId = 'test-c-4'
      const expectedChild1 = 'test-c-5'
      const expectedChild2 = 'test-c-6'
      // Manipulate the data to set correct expected IDs
      serializedSource = {
        ...serializedSource,
        id: expectedId,
        name: newCmp.name,
        children: [
          {
            ...(serializedSource.children?.[0] as ISerializedComponent),
            id: expectedChild1,
            parentId: expectedId,
          },
          {
            ...(serializedSource.children?.[1] as ISerializedComponent),
            id: expectedChild2,
            parentId: expectedId,
          },
        ],
      }
      // Two children from parent, the new component, and 2 more children
      expect(newComponentCount).toEqual(componentCount + 3)
      expect(serializeComponent(addedCmp as IComponent)).toEqual(serializedSource)

      // Make sure copied component properties are new objects
      const isCmp = resolveComponent(site.context, is)
      expect(isCmp?.children?.[0].style.custom['breakpoint-1']).not.toBe(
        addedCmp?.children?.[0].style.custom['breakpoint-1'],
      )

      // Undo
      undoAddComponent(site, data)

      newComponentCount = Object.keys(site.context.components).length
      expect(newComponentCount).toEqual(componentCount)
      // Stringify and parse site to clear undefined keys
      expect(JSON.parse(stringifySite(site))).toEqual(JSON.parse(siteCheckpoint))
    })
  })

  it('should register editor events in the editor context', () => {
    const event: IEditorEvent = {
      name: EditorEventName.OnPageChange,
      behaviors: [{ behaviorId: 'test-behavior-id' }],
    }
    const componentEvents: IComponentEditorEvents = {
      [EditorEventName.OnPageChange]: event,
    }

    const newCmp = mockSerializedComponent(site)
    const data = addComponentDataWithSelected(newCmp, site.editor)
    data.editorEvents = componentEvents
    applyAddComponent(site, data)

    // Assert event is added to editor context
    const editorEventsBefore = site.editor?.editorEvents ?? {}
    expect(editorEventsBefore[newCmp.id]).toEqual(componentEvents)

    // Undo add component
    undoAddComponent(site, data)

    // Assert component editor events removed
    const editorEventsAfter = site.editor?.editorEvents ?? {}
    expect(editorEventsAfter[newCmp.id]).toBeUndefined()
  })

  it('should trigger OnSelfAdded event', () => {
    const {
      oldBehavior,
      componentData,
      mock: noBehaviorMock,
    } = setupMockBehavior(site, [EditorEventName.OnSelfAdded])

    applyAddComponent(site, componentData)
    expect(noBehaviorMock).toHaveBeenCalledTimes(1)

    builtinBehaviors[noBehaviorId] = oldBehavior
  })

  it('should add a new entry of component tree item expand state in editor context', () => {
    // Collapse all items before adding a component
    const { componentTreeExpandedItems = {} } = site.editor ?? {}
    expect(Object.keys(componentTreeExpandedItems)).toEqual(['test-c-0', 'test-c-1'])

    // Add a component
    const newCmp = mockSerializedComponent(site, {
      parentId: 'test-c-1',
    })
    const data = addComponentDataWithSelected(newCmp, site.editor)
    applyAddComponent(site, data)

    // Assert new key is inserted
    expect(Object.keys(componentTreeExpandedItems)).toEqual([
      'test-c-0',
      'test-c-1',
      newCmp.id,
    ])
  })

  it('should expand ancestor items in component tree', () => {
    // Collapse all items before adding a component
    const { componentTreeExpandedItems = {} } = site.editor ?? {}
    expect(Object.keys(componentTreeExpandedItems)).toHaveLength(componentCount)

    for (const componentId in site.context.components) {
      expect(componentTreeExpandedItems[componentId]).toBeDefined()
      componentTreeExpandedItems[componentId] = false
    }

    // Add a component
    const newCmp = mockSerializedComponent(site, {
      parentId: 'test-c-1',
    })
    const data = addComponentDataWithSelected(newCmp, site.editor)
    applyAddComponent(site, data)

    // Assert ancestor items are expanded
    expect(Object.keys(componentTreeExpandedItems)).toHaveLength(componentCount + 1)

    for (const componentId in site.context.components) {
      expect(componentTreeExpandedItems[componentId]).toEqual(true)
    }
  })
})
