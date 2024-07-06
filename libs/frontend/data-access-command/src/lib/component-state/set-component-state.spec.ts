import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { ISetComponentStateData } from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applySetComponentState, undoSetComponentState } from './set-component-state'

describe('Set Component State', () => {
  let siteString: string
  let site: ISite
  let component: IComponent
  let newKey: string

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    const serialized = mockSerializedComponent(site)
    applyAddComponent(site, mockAddComponentData(serialized))
    component = resolveComponent(site.context, serialized.id) as IComponent
    newKey = 'mystate'
  })

  // Helper for setting up a state key/value pair
  const addState = (k: string, v: string) => {
    const addData: ISetComponentStateData = {
      componentId: component.id,
      newKey: k,
      newVal: v,
    }
    applySetComponentState(site, addData)
  }

  it('should add component state and undo', () => {
    const newVal = 'test123'

    // Assert no state in component
    expect(component.state).toBe(undefined)

    // Set component state
    const data: ISetComponentStateData = {
      componentId: component.id,
      newKey,
      newVal,
    }
    applySetComponentState(site, data)
    // Assert state is added
    expect(component.state?.[newKey]).toEqual(newVal)

    undoSetComponentState(site, data)
    // Assert new state is removed
    expect(component.state).toBe(undefined)
  })

  it('should remove component state', () => {
    const newVal = 'test123'

    // Set up component with state
    addState(newKey, newVal)

    // Set component state and undo
    const data: ISetComponentStateData = {
      componentId: component.id,
      oldKey: newKey,
      oldVal: newVal,
    }
    applySetComponentState(site, data)
    // Assert state is removed
    expect(component.state).toBe(undefined)

    undoSetComponentState(site, data)
    // Assert input added again
    expect(component.state?.[newKey]).toEqual(newVal)
  })

  it('should update component state key', () => {
    const newVal = 'test123'
    const newKey2 = 'new-key-2'

    // Set up component with state
    addState(newKey, newVal)

    // Set component state and undo
    const data: ISetComponentStateData = {
      componentId: component.id,
      oldKey: newKey,
      oldVal: newVal,
      newKey: newKey2,
    }
    applySetComponentState(site, data)
    // Assert key is changed
    expect(component.state?.[newKey]).toBeUndefined()
    expect(component.state?.[newKey2]).toEqual(newVal)
    expect(Object.keys(component.state ?? {}).length).toEqual(1)

    undoSetComponentState(site, data)

    expect(component.state?.[newKey2]).toBeUndefined()
    expect(component.state?.[newKey]).toEqual(newVal)
    expect(Object.keys(component.state ?? {}).length).toEqual(1)
  })

  it('should update component state value', () => {
    const newVal = 'test123'
    const newVal2 = 'new-val-2'

    // Set up component with state
    addState(newKey, newVal)

    // Set component state and undo
    const data: ISetComponentStateData = {
      componentId: component.id,
      oldKey: newKey,
      oldVal: newVal,
      newVal: newVal2,
    }
    applySetComponentState(site, data)
    // Assert value is changed
    expect(component.state?.[newKey]).toEqual(newVal2)
    expect(Object.keys(component.state ?? {}).length).toEqual(1)

    undoSetComponentState(site, data)

    expect(component.state?.[newKey]).toEqual(newVal)
    expect(Object.keys(component.state ?? {}).length).toEqual(1)
  })

  it('should update component state key and value', () => {
    const newVal = 'test123'
    const newKey2 = 'new-key-2'
    const newVal2 = 'new-val-2'

    // Set up component with state
    addState(newKey, newVal)

    // Set component state and undo
    const data: ISetComponentStateData = {
      componentId: component.id,
      oldKey: newKey,
      newKey: newKey2,
      oldVal: newVal,
      newVal: newVal2,
    }
    applySetComponentState(site, data)
    // Assert key and value changed
    expect(component.state?.[newKey2]).toEqual(newVal2)
    expect(Object.keys(component.state ?? {}).length).toEqual(1)

    undoSetComponentState(site, data)

    expect(component.state?.[newKey]).toEqual(newVal)
    expect(Object.keys(component.state ?? {}).length).toEqual(1)
  })
})
