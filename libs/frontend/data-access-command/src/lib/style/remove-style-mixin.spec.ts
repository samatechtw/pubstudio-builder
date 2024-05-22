import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import {
  mockRemoveStyleMixinData,
  mockSerializedSite,
} from '@pubstudio/frontend/util-test-mock'
import { ISite, IStyle } from '@pubstudio/shared/type-site'
import { applyAddStyleMixin } from './add-style-mixin'
import { applyRemoveStyleMixin, undoRemoveStyleMixin } from './remove-style-mixin'

describe('Remove Style Mixin', () => {
  let siteString: string
  let site: ISite
  let styleToBeRemoved: IStyle
  let totalStylesCount: number

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Prepare style
    applyAddStyleMixin(site, {
      name: 'first-style',
      breakpoints: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: {
            'background-color': 'red',
          },
        },
      },
    })
    applyAddStyleMixin(site, {
      name: 'second-style',
      breakpoints: {
        [DEFAULT_BREAKPOINT_ID]: {
          ':hover': {
            'font-size': '100px',
          },
        },
      },
    })
    totalStylesCount = 3
    const styles = Object.values(site.context.styles)
    expect(styles).toHaveLength(totalStylesCount)
    styleToBeRemoved = structuredClone(styles[0])
  })

  it('should remove style mixin', () => {
    // Assert style mixin exists in site context before removing
    expect(styleToBeRemoved.id in site.context.styles).toEqual(true)

    // Remove style mixin
    const data = mockRemoveStyleMixinData({ ...styleToBeRemoved })
    applyRemoveStyleMixin(site, data)

    // Assert style mixin is removed
    expect(Object.keys(site.context.styles)).toHaveLength(totalStylesCount - 1)
    expect(styleToBeRemoved.id in site.context.styles).toEqual(false)
    expect(site.context.styleOrder.includes(styleToBeRemoved.id)).toBe(false)
  })

  it('should undo remove style mixin', () => {
    // Remove style mixin and undo
    const data = mockRemoveStyleMixinData({ ...styleToBeRemoved })
    applyRemoveStyleMixin(site, data)
    undoRemoveStyleMixin(site, data)

    // Assert style mixin still exists
    expect(Object.keys(site.context.styles)).toHaveLength(totalStylesCount)
    expect(site.context.styles[styleToBeRemoved.id]).toEqual(styleToBeRemoved)
    expect(site.context.styleOrder.includes(styleToBeRemoved.id)).toBe(true)
  })

  it('remove and undo should result in the same style order', () => {
    // Remove 3rd style
    styleToBeRemoved =
      site.context.styles[site.context.styleOrder[site.context.styleOrder.length - 1]]

    // Add another style for testing
    applyAddStyleMixin(site, {
      name: 'third-style',
      breakpoints: { [DEFAULT_BREAKPOINT_ID]: {} },
    })
    // Assert expected style precedence
    expect(site.context.styleOrder.indexOf(styleToBeRemoved.id)).toEqual(2)

    // Remove style mixin and undo
    const data = mockRemoveStyleMixinData({ ...styleToBeRemoved })
    applyRemoveStyleMixin(site, data)
    undoRemoveStyleMixin(site, data)

    // Assert expected style precedence
    expect(site.context.styleOrder.indexOf(styleToBeRemoved.id)).toEqual(2)

    // Remove first two styles and check order
    // Get style ID for verification
    const mixin1 = site.context.styles[site.context.styleOrder[0]]
    const mixin2 = site.context.styles[site.context.styleOrder[1]]
    const data1 = mockRemoveStyleMixinData({ ...mixin1 })
    const data2 = mockRemoveStyleMixinData({ ...mixin2 })
    applyRemoveStyleMixin(site, data1)
    applyRemoveStyleMixin(site, data2)
    expect(site.context.styleOrder.indexOf(styleToBeRemoved.id)).toEqual(0)
    expect(site.context.styleOrder.includes(mixin1.id)).toBe(false)
    expect(site.context.styleOrder.includes(mixin2.id)).toBe(false)
    undoRemoveStyleMixin(site, data2)

    // Verify order
    expect(site.context.styleOrder.indexOf(mixin2.id)).toEqual(0)
  })
})
