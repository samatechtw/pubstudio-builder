import { applyCommand } from '@pubstudio/frontend/data-access-command'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { CommandType } from '@pubstudio/shared/type-command'
import { Css, CssPseudoClass, ISite, Tag } from '@pubstudio/shared/type-site'
import { getLivePageStyle } from './get-page-style'

const OTHER_ROUTE = '/second'

// Source on /home, instance on /second — the shape every shared header and footer has.
describe('getLivePageStyle with custom components', () => {
  let site: ISite
  let sourceId: string
  let sourceChildId: string

  const idsOf = (route: string) =>
    Object.keys(
      getLivePageStyle(site.context, site.pages[route]).custom[DEFAULT_BREAKPOINT_ID],
    )

  beforeEach(() => {
    site = deserializeSite(JSON.stringify(mockSerializedSite)) as ISite

    applyCommand(site, {
      type: CommandType.AddPage,
      data: {
        metadata: { route: OTHER_ROUTE, name: 'Second', public: true, head: {} },
        activePageRoute: site.defaults.homePage,
      },
    })

    // Two nodes, so custom children are covered too
    const parentId = site.pages[site.defaults.homePage].root.id
    const source = { type: CommandType.AddComponent, data: { tag: Tag.Div, parentId } }
    applyCommand(site, source)
    sourceId = (source.data as { id?: string }).id as string
    const child = {
      type: CommandType.AddComponent,
      data: { tag: Tag.Div, parentId: sourceId },
    }
    applyCommand(site, child)
    sourceChildId = (child.data as { id?: string }).id as string

    for (const componentId of [sourceId, sourceChildId]) {
      applyCommand(site, {
        type: CommandType.SetComponentCustomStyle,
        data: {
          componentId,
          breakpointId: DEFAULT_BREAKPOINT_ID,
          newStyle: {
            pseudoClass: CssPseudoClass.Default,
            property: Css.Color,
            value: '#abcdef',
          },
        },
      })
    }
    applyCommand(site, {
      type: CommandType.AddCustomComponent,
      data: { componentId: sourceId },
    })

    applyCommand(site, {
      type: CommandType.AddComponent,
      data: {
        tag: Tag.Div,
        parentId: site.pages[OTHER_ROUTE].root.id,
        customComponentId: sourceId,
      },
    })
  })

  it('emits the source rules on the page holding the instance', () => {
    expect(idsOf(OTHER_ROUTE)).toEqual(
      expect.arrayContaining([`.${sourceId}`, `.${sourceChildId}`]),
    )
  })

  it('resolves those rules rather than emitting them raw', () => {
    const custom = getLivePageStyle(site.context, site.pages[OTHER_ROUTE]).custom
    expect(custom[DEFAULT_BREAKPOINT_ID][`.${sourceId}`]).toEqual({ color: '#abcdef' })
  })

  it('still emits them on the page holding the source, exactly once', () => {
    const selectors = idsOf(site.defaults.homePage)
    expect(selectors).toEqual(expect.arrayContaining([`.${sourceId}`]))
    expect(selectors.filter((s) => s === `.${sourceId}`)).toHaveLength(1)
  })

  it('emits nothing extra for a site with no custom components', () => {
    const plain = deserializeSite(JSON.stringify(mockSerializedSite)) as ISite
    const style = getLivePageStyle(plain.context, plain.pages[plain.defaults.homePage])
    expect(Object.keys(style.custom[DEFAULT_BREAKPOINT_ID])).toEqual([])
  })
})
