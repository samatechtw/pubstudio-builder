import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddStyleMixinData,
  mockEditStyleMixinData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IPseudoStyle, ISite } from '@pubstudio/shared/type-site'
import { applyAddStyleMixin } from './add-style-mixin'
import { applyEditStyleMixin, undoEditStyleMixin } from './edit-style-mixin'

describe('Edit Style Mixin', () => {
  let siteString: string
  let site: ISite
  let mixinId: string
  let oldName: string
  let newName: string

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Prepare old style
    const oldPseudoStyle: IPseudoStyle = {
      default: {
        'background-color': 'red',
      },
    }
    applyAddStyleMixin(site, mockAddStyleMixinData(undefined, oldPseudoStyle))
    const styles = Object.values(site.context.styles)
    // One mixin in initial site, one new mixin
    expect(styles).toHaveLength(2)
    mixinId = styles[0].id
    oldName = styles[0].name

    // Prepare new style
    newName = 'new-style'
  })

  it('should edit style mixin', () => {
    // Assert style mixin before update
    const style = site.context.styles[mixinId]
    expect(style.name).toEqual(oldName)

    // Update style mixin
    const data = mockEditStyleMixinData(mixinId, oldName, newName)
    applyEditStyleMixin(site, data)

    // Assert style mixin is updated
    expect(style.name).toEqual(newName)
  })

  it('should undo edit style mixin', () => {
    // Update style mixin and undo
    const data = mockEditStyleMixinData(mixinId, oldName, newName)
    applyEditStyleMixin(site, data)
    undoEditStyleMixin(site, data)

    // Assert style mixin is not modified
    expect(site.context.styles[mixinId].name).toEqual(oldName)
  })
})
