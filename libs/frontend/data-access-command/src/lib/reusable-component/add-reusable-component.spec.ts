import { makeAddBuiltinComponentData } from '@pubstudio/frontend/util-command-data'
import { buttonId } from '@pubstudio/frontend/util-ids'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import {
  IAddComponentData,
  IAddReusableComponentData,
} from '@pubstudio/shared/type-command-data'
import { IComponent, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import {
  applyAddReusableComponent,
  undoAddReusableComponent,
} from './add-reusable-component'

describe('Add Reusable Component', () => {
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

  it('should make component reusable and undo', () => {
    // Assert component is not reusable
    expect(site.editor?.reusableComponentIds.has(component.id)).toBe(false)

    // Set to reusable
    const data: IAddReusableComponentData = {
      componentId: component.id,
    }
    applyAddReusableComponent(site, data)
    // Assert component is reusable
    expect(site.editor?.reusableComponentIds.has(component.id)).toBe(true)
    const children = component.children ?? []
    expect(children).toHaveLength(2)
    for (const child of children) {
      expect(site.editor?.reusableChildIds.has(child.id)).toBe(true)
    }

    undoAddReusableComponent(site, data)

    // Assert component is not reusable
    expect(site.editor?.reusableComponentIds.has(component.id)).toBe(false)
    for (const child of children) {
      expect(site.editor?.reusableChildIds.has(child.id)).toBe(false)
    }
  })
})
