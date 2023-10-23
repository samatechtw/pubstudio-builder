import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { ISetComponentInputData } from '@pubstudio/shared/type-command-data'
import {
  ComponentArgPrimitive,
  IComponent,
  IComponentInput,
  ISite,
} from '@pubstudio/shared/type-site'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/web/util-test-mock'
import { applyAddComponent } from '../component/add-component'
import { applySetComponentInput, undoSetComponentInput } from './set-component-input'

describe('Set Component Input', () => {
  let siteString: string
  let site: ISite
  let component: IComponent
  let input: IComponentInput

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    const serialized = mockSerializedComponent(site)
    input = {
      name: 'text',
      type: ComponentArgPrimitive.String,
      default: 'TEST',
      is: 'TEST',
    }
    applyAddComponent(site, mockAddComponentData(serialized))
    component = resolveComponent(site.context, serialized.id) as IComponent
  })

  it('should add component input and undo', () => {
    // Assert no inputs in component
    expect(component.inputs).toBe(undefined)

    // Set component input
    const data: ISetComponentInputData = {
      componentId: component.id,
      newInput: input,
    }
    applySetComponentInput(site, data)
    // Assert input is added
    expect(component.inputs?.[input.name]).toEqual(input)

    undoSetComponentInput(site, data)
    // Assert new input is removed
    expect(component.inputs).toBe(undefined)
  })

  it('should remove component input', () => {
    // Set up component with input
    const serialized = mockSerializedComponent(site, { inputs: { [input.name]: input } })
    applyAddComponent(site, mockAddComponentData(serialized))
    const component = resolveComponent(site.context, serialized.id) as IComponent

    // Set component input and undo
    const data: ISetComponentInputData = {
      componentId: component.id,
      oldInput: input,
    }
    applySetComponentInput(site, data)
    // Assert input is removed
    expect(component.inputs).toBe(undefined)

    undoSetComponentInput(site, data)
    // Assert input added again
    expect(component.inputs?.[input.name]).toEqual(input)
  })

  it('should update component input', () => {
    // Set up component with input
    const serialized = mockSerializedComponent(site, { inputs: { [input.name]: input } })
    applyAddComponent(site, mockAddComponentData(serialized))
    const component = resolveComponent(site.context, serialized.id) as IComponent

    const newInput: IComponentInput = { ...input, name: 'TEST2', default: 'OK!' }
    const data: ISetComponentInputData = {
      componentId: component.id,
      oldInput: input,
      newInput,
    }
    applySetComponentInput(site, data)
    // Assert input is updated
    expect(component.inputs?.[newInput.name]).toEqual(newInput)
    expect(component.inputs?.[input.name]).toBeUndefined()

    undoSetComponentInput(site, data)
    // Assert input is reverted
    expect(component.inputs?.[newInput.name]).toBeUndefined()
    expect(component.inputs?.[input.name]).toEqual(input)
  })
})
