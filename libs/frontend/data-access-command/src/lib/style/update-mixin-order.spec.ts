import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { IUpdateMixinOrderData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applyAddStyleMixin } from './add-style-mixin'
import { applyUpdateMixinOrder, undoUpdateMixinOrder } from './update-mixin-order'

describe('Update Style Mixin Order', () => {
  let siteString: string
  let site: ISite

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    // Prepare styles
    applyAddStyleMixin(site, {
      name: 'first-style',
      breakpoints: {
        [DEFAULT_BREAKPOINT_ID]: {
          default: { 'background-color': 'red' },
        },
      },
    })
    applyAddStyleMixin(site, {
      name: 'second-style',
      breakpoints: {
        [DEFAULT_BREAKPOINT_ID]: {
          ':hover': { 'font-size': '100px' },
        },
      },
    })
    applyAddStyleMixin(site, {
      name: 'third-style',
      breakpoints: { [DEFAULT_BREAKPOINT_ID]: {} },
    })
    const styles = Object.values(site.context.styles)
    expect(styles).toHaveLength(4)
  })

  it('should update style mixin order and undo', () => {
    // Remember initial order
    const initialOrder = [...site.context.styleOrder]
    const mixin1 = site.context.styleOrder[0]

    // Update style mixin order
    const data: IUpdateMixinOrderData = { pos: 0, newPos: 1 }
    applyUpdateMixinOrder(site, data)

    // Assert order is updated
    expect(site.context.styleOrder).toHaveLength(initialOrder.length)
    expect(site.context.styleOrder[1]).toEqual(mixin1)

    // Undo
    undoUpdateMixinOrder(site, data)

    // Assert origin order
    expect(site.context.styleOrder).toEqual(initialOrder)
  })

  it('should move mixin to highest precedence', () => {
    // Remember initial order
    const initialOrder = [...site.context.styleOrder]
    const mixin1 = site.context.styleOrder[0]
    const newPos = initialOrder.length - 1

    // Update style mixin order
    const data: IUpdateMixinOrderData = { pos: 0, newPos }
    applyUpdateMixinOrder(site, data)

    // Assert order is updated
    expect(site.context.styleOrder).toHaveLength(initialOrder.length)
    expect(site.context.styleOrder[newPos]).toEqual(mixin1)

    // Undo
    undoUpdateMixinOrder(site, data)

    // Assert origin order
    expect(site.context.styleOrder).toEqual(initialOrder)
  })
})
