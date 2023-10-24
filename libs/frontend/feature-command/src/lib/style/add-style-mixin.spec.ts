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
    // Assert there's no style mixin in site context
    expect(Object.keys(site.context.styles)).toHaveLength(0)

    // Add style mixin
    const data = mockAddStyleMixinData(styleName, pseudoStyle)
    applyAddStyleMixin(site, data)

    // Assert style mixin is added to site context
    const styleIds = Object.keys(site.context.styles)
    expect(styleIds).toHaveLength(1)

    const styleId = styleIds[0]
    expect(site.context.styles[styleId]).toEqual({
      id: styleId,
      name: styleName,
      breakpoints: {
        [DEFAULT_BREAKPOINT_ID]: pseudoStyle,
      },
    })
  })

  it('should undo add style mixin', () => {
    // Add style and  mixinundo
    const data = mockAddStyleMixinData(styleName, pseudoStyle)
    applyAddStyleMixin(site, data)
    undoAddStyleMixin(site, data)

    // Assert there's no style mixin in site context
    expect(Object.keys(site.context.styles)).toHaveLength(0)
  })
})
