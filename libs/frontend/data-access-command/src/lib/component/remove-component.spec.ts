import { builtinBehaviors } from '@pubstudio/frontend/util-builtin'
import { makeRemoveComponentData } from '@pubstudio/frontend/util-command-data'
import { noBehaviorId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { stringifySite } from '@pubstudio/frontend/util-site-store'
import {
  addComponentDataWithSelected,
  expectSiteWithoutComponentTree,
  setupMockBehavior,
} from '@pubstudio/frontend/util-test'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import {
  EditorEventName,
  IComponent,
  IComponentEditorEvents,
  IEditorEvent,
  ISite,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from './add-component'
import { applyRemoveComponent, undoRemoveComponent } from './remove-component'

describe('Remove Component', () => {
  let siteString: string
  let site: ISite
  let componentCount: number

  beforeEach(() => {
    // Select the component that will be deleted, so undo matches
    // Undoing RemoveComponent selects the un-deleted component, which may not be
    // the component that was previously selected.
    if (mockSerializedSite.editor) {
      mockSerializedSite.editor.selectedComponentId = 'test-c-1'
    }
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    componentCount = Object.keys(site.context.components).length
  })

  it('should remove component with no `is`, children, or content, then undo', () => {
    const deleteCmp = resolveComponent(site.context, 'test-c-1') as IComponent

    const data = makeRemoveComponentData(site, deleteCmp)
    applyRemoveComponent(site, data)
    const rootChildren = site.pages['/home']?.root.children

    let newComponentCount = Object.keys(site.context.components).length
    expect(newComponentCount).toEqual(componentCount - 1)
    expect(rootChildren).toBeUndefined()

    undoRemoveComponent(site, data)
    newComponentCount = Object.keys(site.context.components).length
    expect(newComponentCount).toEqual(componentCount)
    expectSiteWithoutComponentTree(site, mockSerializedSite)
  })

  it('should clear component editor events in the editor context', () => {
    const event: IEditorEvent = {
      name: EditorEventName.OnPageChange,
      behaviors: [{ behaviorId: 'test-behavior-id' }],
    }
    const componentEvents: IComponentEditorEvents = {
      [EditorEventName.OnPageChange]: event,
    }

    // Add a component with an editor event
    const newCmp = mockSerializedComponent(site)
    const data = addComponentDataWithSelected(newCmp, site.editor)
    data.editorEvents = componentEvents
    applyAddComponent(site, data)

    // Assert event is added to editor context
    const editorEventsBefore = site.editor?.editorEvents ?? {}
    expect(editorEventsBefore[newCmp.id]).toEqual(componentEvents)

    // Remove component
    const deleteCmp = resolveComponent(site.context, newCmp.id) as IComponent

    const removeData = makeRemoveComponentData(site, deleteCmp)
    applyRemoveComponent(site, removeData)

    // Assert component editor events removed
    const editorEventsAfter1 = site.editor?.editorEvents ?? {}
    expect(editorEventsAfter1[newCmp.id]).toBeUndefined()

    // Undo remove
    undoRemoveComponent(site, removeData)

    // Assert component editor events added back to editor context
    const editorEventsAfter2 = site.editor?.editorEvents ?? {}
    expect(editorEventsAfter2[newCmp.id]).toEqual(componentEvents)
  })

  it('undo should trigger OnSelfAdded event', () => {
    const {
      oldBehavior,
      componentData,
      mock: noBehaviorMock,
    } = setupMockBehavior(site, [EditorEventName.OnSelfAdded])

    applyAddComponent(site, componentData)
    expect(noBehaviorMock).toHaveBeenCalledTimes(1)

    // Remove component
    const deleteCmp = resolveComponent(site.context, componentData.id) as IComponent
    const removeData = makeRemoveComponentData(site, deleteCmp)
    applyRemoveComponent(site, removeData)

    // Undo and assert OnSelfAdded event is called
    undoRemoveComponent(site, removeData)
    expect(noBehaviorMock).toHaveBeenCalledTimes(2)

    builtinBehaviors[noBehaviorId] = oldBehavior
  })

  describe('with `is`/children', () => {
    let siteCheckpoint: string

    beforeEach(() => {
      // Add two children to a component
      const childData = mockAddComponentData(mockSerializedComponent(site))
      applyAddComponent(site, childData)
      applyAddComponent(site, childData)
      // Select the component that will be deleted, so undo matches
      if (site.editor) {
        site.editor.selectedComponent = resolveComponent(
          site.context,
          'test-c-1',
        ) as IComponent
      }
      // Save the state to compare later
      siteCheckpoint = stringifySite(site)
      componentCount = Object.keys(site.context.components).length
    })

    it('should remove component with children and undo', () => {
      const deleteCmp = resolveComponent(site.context, 'test-c-1') as IComponent

      const data = makeRemoveComponentData(site, deleteCmp)
      applyRemoveComponent(site, data)
      const rootChildren = site.pages['/home']?.root.children

      let newComponentCount = Object.keys(site.context.components).length
      expect(newComponentCount).toEqual(componentCount - 3)
      expect(rootChildren).toBeUndefined()

      undoRemoveComponent(site, data)
      newComponentCount = Object.keys(site.context.components).length
      expect(newComponentCount).toEqual(componentCount)
      expect(JSON.parse(stringifySite(site))).toEqual(JSON.parse(siteCheckpoint))
    })
  })
})
