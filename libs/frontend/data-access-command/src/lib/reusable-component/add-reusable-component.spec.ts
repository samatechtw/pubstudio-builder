import { resolveComponent } from '@pubstudio/frontend/util-builtin'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IAddReusableComponentData } from '@pubstudio/shared/type-command-data'
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
    const serialized = mockSerializedComponent(site)
    applyAddComponent(site, mockAddComponentData(serialized))
    component = resolveComponent(site.context, serialized.id) as IComponent
  })

  it('should make component reusable and undo', () => {
    // Assert component is not reusable
    expect(site.editor?.reusableComponentIds.has(component.id)).toBe(false)

    // Set to reusable
    const data: IAddReusableComponentData = {
      componentIds: [component.id],
    }
    applyAddReusableComponent(site, data)
    // Assert component is reusable
    expect(site.editor?.reusableComponentIds.has(component.id)).toBe(true)

    undoAddReusableComponent(site, data)

    // Assert component is not reusable
    expect(site.editor?.reusableComponentIds.has(component.id)).toBe(false)
  })
})
