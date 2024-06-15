import { makeAddBuiltinComponentData } from '@pubstudio/frontend/util-command-data'
import { buttonId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import {
  IAddComponentData,
  IAddCustomComponentData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applyAddCustomComponent, undoAddCustomComponent } from './add-custom-component'

describe('Add Custom Component', () => {
  let siteString: string
  let site: ISite
  let component: IComponent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Add button, which has three children
    const parent = resolveComponent(site.context, 'test-c-1') as IComponent
    const addCmp = makeAddBuiltinComponentData(buttonId, parent, parent.id)
    applyAddComponent(site, addCmp as IAddComponentData)
    component = resolveComponent(site.context, addCmp?.id) as IComponent
  })

  it('should make component custom and undo', () => {
    // Assert component is not custom
    expect(site.context?.customComponentIds.has(component.id)).toBe(false)

    // Set to custom
    const data: IAddCustomComponentData = {
      componentId: component.id,
    }
    applyAddCustomComponent(site, data)
    // Assert component is custom
    expect(site.context?.customComponentIds.has(component.id)).toBe(true)
    const children = component.children ?? []
    expect(children).toHaveLength(2)
    for (const child of children) {
      expect(site.context?.customChildIds.has(child.id)).toBe(true)
    }

    undoAddCustomComponent(site, data)

    // Assert component is not custom
    expect(site.context?.customComponentIds.has(component.id)).toBe(false)
    for (const child of children) {
      expect(site.context?.customChildIds.has(child.id)).toBe(false)
    }
  })
})
