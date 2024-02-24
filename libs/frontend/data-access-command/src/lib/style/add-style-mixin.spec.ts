import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockAddStyleMixinData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { IPseudoStyle, ISite } from '@pubstudio/shared/type-site'
import { applyAddStyleMixin, undoAddStyleMixin } from './add-style-mixin'

describe('Add Style Mixin', () => {
  let siteString: string
  let site: ISite
  let styleName: string | undefined
  let pseudoStyle: IPseudoStyle

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite
    styleName = 'my-style'
    pseudoStyle = {
      default: {
        'background-color': 'red',
      },
    }
  })

  it('should add style mixin to site', () => {
    // Assert there's one default mixin in site context
    const defaultMixinIds = Object.keys(site.context.styles)
    expect(defaultMixinIds).toHaveLength(1)
    const defaultMixinId = defaultMixinIds[0]

    // Add style mixin
    const data = mockAddStyleMixinData(styleName, pseudoStyle)
    applyAddStyleMixin(site, data)

    // Assert style mixin is added to site context
    const styleIds = Object.keys(site.context.styles)
    expect(styleIds).toHaveLength(2)
    const newMixinId = styleIds.find((id) => id !== defaultMixinId) ?? ''
    expect(newMixinId).toBeTruthy()

    expect(site.context.styles[newMixinId]).toEqual({
      id: newMixinId,
      name: styleName,
      breakpoints: {
        [DEFAULT_BREAKPOINT_ID]: pseudoStyle,
      },
    })
  })

  it('should undo add style mixin', () => {
    // Add style and mixin undo
    const data = mockAddStyleMixinData(styleName, pseudoStyle)
    applyAddStyleMixin(site, data)
    undoAddStyleMixin(site, data)

    // Assert there's one mixin in site context
    expect(Object.keys(site.context.styles)).toHaveLength(1)
  })
})
