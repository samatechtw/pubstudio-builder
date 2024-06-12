import { noBehaviorId, toggleHiddenId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { ISetComponentEditorEventData } from '@pubstudio/shared/type-command-data'
import {
  EditorEventName,
  IComponent,
  IEditorEvent,
  ISite,
} from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import {
  applySetComponentEditorEvent,
  undoSetComponentEditorEvent,
} from './set-component-editor-event'

describe('Set Component Editor Event', () => {
  let siteString: string
  let site: ISite
  let component: IComponent
  let event: IEditorEvent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    const serialized = mockSerializedComponent(site)
    event = {
      name: EditorEventName.OnIsInputChange,
      behaviors: [{ behaviorId: toggleHiddenId }],
    }
    applyAddComponent(site, mockAddComponentData(serialized))
    component = resolveComponent(site.context, serialized.id) as IComponent
  })

  it('should add component editor event and undo', () => {
    // Assert no events in component
    expect(component.editorEvents).toBe(undefined)

    // Set component event
    const data: ISetComponentEditorEventData = {
      componentId: component.id,
      newEvent: event,
    }
    applySetComponentEditorEvent(site, data)
    // Assert event is added
    expect(component.editorEvents?.[event.name as EditorEventName]).toEqual(event)

    undoSetComponentEditorEvent(site, data)
    // Assert new event is removed
    expect(component.editorEvents).toBe(undefined)
  })

  it('should remove component editor event', () => {
    // Set up component with event
    const serialized = mockSerializedComponent(site, { events: { [event.name]: event } })
    applyAddComponent(site, mockAddComponentData(serialized))
    const component = resolveComponent(site.context, serialized.id) as IComponent

    // Set component event and undo
    const data: ISetComponentEditorEventData = {
      componentId: component.id,
      oldEvent: event,
    }
    applySetComponentEditorEvent(site, data)
    // Assert event is removed
    expect(component.editorEvents).toBe(undefined)

    undoSetComponentEditorEvent(site, data)
    // Assert event added again
    expect(component.editorEvents?.[event.name as EditorEventName]).toEqual(event)
  })

  it('should update component editor event', () => {
    // Set up component with event
    const serialized = mockSerializedComponent(site, { events: { [event.name]: event } })
    applyAddComponent(site, mockAddComponentData(serialized))
    const component = resolveComponent(site.context, serialized.id) as IComponent

    const newEvent: IEditorEvent = {
      ...event,
      name: EditorEventName.OnPageAdd,
      behaviors: [{ behaviorId: noBehaviorId }],
    }
    const data: ISetComponentEditorEventData = {
      componentId: component.id,
      oldEvent: event,
      newEvent,
    }
    applySetComponentEditorEvent(site, data)
    // Assert editor event is updated
    expect(component.editorEvents?.[newEvent.name as EditorEventName]).toEqual(newEvent)
    expect(component.editorEvents?.[event.name as EditorEventName]).toBeUndefined()

    undoSetComponentEditorEvent(site, data)
    // Assert editor event is reverted
    expect(component.editorEvents?.[newEvent.name as EditorEventName]).toBeUndefined()
    expect(component.editorEvents?.[event.name as EditorEventName]).toEqual(event)
  })

  it('should add and remove event arg', () => {
    const newEvent: IEditorEvent = {
      ...event,
      behaviors: [
        {
          ...event.behaviors[0],
          args: { id: 'test-c-1' },
        },
      ],
    }
    const data: ISetComponentEditorEventData = {
      componentId: component.id,
      oldEvent: event,
      newEvent,
    }
    applySetComponentEditorEvent(site, data)
    // Assert editor event with args is added
    expect(
      component.editorEvents?.[newEvent.name as EditorEventName]?.behaviors[0]?.args?.id,
    ).toEqual('test-c-1')

    // Remove arg by replacing the editor event with the original version
    applySetComponentEditorEvent(site, {
      componentId: component.id,
      oldEvent: newEvent,
      newEvent: event,
    })
    // Assert arg is removed
    expect(
      component.editorEvents?.[newEvent.name as EditorEventName]?.behaviors[0].args,
    ).toBeUndefined()
  })
})
