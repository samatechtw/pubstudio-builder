import { horizontalStyle, verticalStyle } from '@pubstudio/frontend/util-builtin'
import { resolveComponent } from '@pubstudio/frontend/util-resolve'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IAddComponentMixinData } from '@pubstudio/shared/type-command-data'
import { ISerializedComponent, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import { applyAddComponentMixin, undoAddComponentMixin } from './add-component-mixin'

describe('Add Component Mixin', () => {
  let siteString: string
  let site: ISite
  let component: ISerializedComponent

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    component = mockSerializedComponent(site, { style: { custom: {} } })
    applyAddComponent(site, mockAddComponentData(component))
  })

  it('should add first component style mixin', () => {
    // Assert there's no mixins yet
    expect(component.style.mixins).toBeUndefined()

    // Add mixin
    const data: IAddComponentMixinData = {
      componentId: component.id,
      mixinId: verticalStyle.id,
    }
    applyAddComponentMixin(site, data)

    // Assert mixin is added
    const resultComponent = resolveComponent(site.context, component.id)
    expect(resultComponent?.style.mixins).toEqual([verticalStyle.id])
  })

  it('should add second component style mixin', () => {
    // Assert there's no mixins yet
    expect(component.style.mixins).toBeUndefined()

    // Add mixin
    const data1: IAddComponentMixinData = {
      componentId: component.id,
      mixinId: verticalStyle.id,
    }
    applyAddComponentMixin(site, data1)
    const data2: IAddComponentMixinData = {
      componentId: component.id,
      mixinId: horizontalStyle.id,
    }
    applyAddComponentMixin(site, data2)

    // Assert mixin is added
    const resultComponent = resolveComponent(site.context, component.id)
    expect(resultComponent?.style.mixins).toEqual([verticalStyle.id, horizontalStyle.id])
  })

  it('should not add duplicate component style mixin', () => {
    // Assert there's no mixins yet
    expect(component.style.mixins).toBeUndefined()

    // Add mixin
    const data: IAddComponentMixinData = {
      componentId: component.id,
      mixinId: verticalStyle.id,
    }
    applyAddComponentMixin(site, data)
    applyAddComponentMixin(site, data)

    // Assert mixin is added
    const resultComponent = resolveComponent(site.context, component.id)
    expect(resultComponent?.style.mixins).toEqual([verticalStyle.id])
  })

  it('should undo add component style mixin', () => {
    // Add mixin and undo
    const data: IAddComponentMixinData = {
      componentId: component.id,
      mixinId: verticalStyle.id,
    }
    applyAddComponentMixin(site, data)
    undoAddComponentMixin(site, data)

    // Assert mixin does not exist in component
    const resultComponent = resolveComponent(site.context, component.id)
    expect(resultComponent?.style.mixins).toBeUndefined()
  })
})
