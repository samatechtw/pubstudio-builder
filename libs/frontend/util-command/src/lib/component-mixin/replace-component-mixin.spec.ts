import {
  horizontalStyle,
  resolveComponent,
  verticalStyle,
} from '@pubstudio/frontend/util-builtin'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddComponentData,
  mockSerializedComponent,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IReplaceComponentMixinData } from '@pubstudio/shared/type-command-data'
import { ISerializedComponent, ISite } from '@pubstudio/shared/type-site'
import { applyAddComponent } from '../component/add-component'
import {
  applyReplaceComponentMixin,
  undoReplaceComponentMixin,
} from './replace-component-mixin'

describe('Replace Component Mixin', () => {
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

  it('should replace component style mixin', () => {
    // Assert there is one mixin
    expect(component.style.mixins).toEqual([verticalStyle.id])

    // Add mixin
    const data: IReplaceComponentMixinData = {
      componentId: component.id,
      oldMixinId: verticalStyle.id,
      newMixinId: horizontalStyle.id,
    }
    applyReplaceComponentMixin(site, data)

    // Assert mixin is added
    const resultCmp = resolveComponent(site.context, component.id)
    expect(resultCmp?.style.mixins).toEqual([horizontalStyle.id])
  })

  it('should undo replace component style mixin', () => {
    // Add mixin and undo
    const data: IReplaceComponentMixinData = {
      componentId: component.id,
      oldMixinId: verticalStyle.id,
      newMixinId: horizontalStyle.id,
    }
    applyReplaceComponentMixin(site, data)
    undoReplaceComponentMixin(site, data)

    // Assert mixin does not exist in component
    const resultCmp = resolveComponent(site.context, component.id)
    expect(resultCmp?.style.mixins).toEqual([verticalStyle.id])
  })
})
