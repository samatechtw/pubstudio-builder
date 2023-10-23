import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { IPseudoStyle, ISite, IStyle } from '@pubstudio/shared/type-site'
import {
  mockAddStyleMixinData,
  mockEditStyleMixinData,
  mockSerializedSite,
} from '@pubstudio/web/util-test-mock'
import { applyAddStyleMixin } from './add-style-mixin'
import { applyEditStyleMixin, undoEditStyleMixin } from './edit-style-mixin'

describe('Edit Style Mixin', () => {
  let siteString: string
  let site: ISite
  let oldStyle: IStyle
  let newStyle: IStyle

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
    expect(styles).toHaveLength(1)
    oldStyle = structuredClone(styles[0])

    // Prepare new style
    newStyle = {
      id: oldStyle.id,
      name: 'new-style',
      breakpoints: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: {
            width: '123px',
            'background-color': 'blue',
          },
        },
      },
    }
  })

  it('should edit style mixin', () => {
    // Assert style mixin before update
    const style = site.context.styles[oldStyle.id]
    expect(style.name).toEqual(oldStyle.name)
    expect(style.breakpoints).toEqual(oldStyle.breakpoints)

    // Update style mixin
    const data = mockEditStyleMixinData(oldStyle, {
      id: oldStyle.id,
      name: newStyle.name,
      breakpoints: newStyle.breakpoints,
    })
    applyEditStyleMixin(site, data)

    // Assert style mixin is updated
    expect(style.name).toEqual(newStyle.name)
    expect(style.breakpoints).toEqual(newStyle.breakpoints)
  })

  it('should undo edit style mixin', () => {
    // Update style mixin and undo
    const data = mockEditStyleMixinData(oldStyle, {
      id: oldStyle.id,
      name: newStyle.name,
      breakpoints: newStyle.breakpoints,
    })
    applyEditStyleMixin(site, data)
    undoEditStyleMixin(site, data)

    // Assert style mixin is not modified
    expect(
      site.context.styles[oldStyle.id].breakpoints[DEFAULT_BREAKPOINT_ID].default?.[
        'background-color'
      ],
    ).toEqual('red')
  })
})
