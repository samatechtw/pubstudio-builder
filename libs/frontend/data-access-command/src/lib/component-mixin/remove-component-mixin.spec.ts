import { verticalStyle } from '@pubstudio/frontend/util-builtin'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IRemoveComponentMixinData } from '@pubstudio/shared/type-command-data'
import { ISerializedComponent, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import {
  applyRemoveComponentMixin,
  undoRemoveComponentMixin,
} from './remove-component-mixin'

describe('Remove Component Mixin', () => {
  let siteString: string
  let site: ISite
  let component: ISerializedComponent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    // Initialize component with mixin
    component = mockSerializedComponent(site, {
      style: { custom: {}, mixins: [verticalStyle.id] },
    })
    applyAddComponent(site, mockAddComponentData(component))
  })

  it('should remove component style mixin', () => {
    // Assert there is one mixin
    expect(component.style.mixins).toEqual([verticalStyle.id])

    // Remove mixin
    const data: IRemoveComponentMixinData = {
      componentId: component.id,
      mixinId: verticalStyle.id,
    }
    applyRemoveComponentMixin(site, data)

    // Assert mixin is added
    const resultCmp = resolveComponent(site.context, component.id)
    expect(resultCmp?.style.mixins).toBeUndefined()
  })

  it('should undo remove component style mixin', () => {
    // Remove mixin and undo
    const data: IRemoveComponentMixinData = {
      componentId: component.id,
      mixinId: verticalStyle.id,
    }
    applyRemoveComponentMixin(site, data)
    undoRemoveComponentMixin(site, data)

    // Assert mixin does not exist in component
    const resultCmp = resolveComponent(site.context, component.id)
    expect(resultCmp?.style.mixins).toEqual([verticalStyle.id])
  })
})
