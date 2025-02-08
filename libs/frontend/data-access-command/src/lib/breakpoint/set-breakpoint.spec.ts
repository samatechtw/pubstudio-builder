import { breakpointId } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { IAddBreakpoint, ISetBreakpointData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'
import { applySetBreakpoint, undoSetBreakpoint } from './set-breakpoint'

describe('Set Breakpoint', () => {
  let siteString: string
  let site: ISite

  let newBreakpoint: IAddBreakpoint
  let data: ISetBreakpointData

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    newBreakpoint = {
      id: undefined,
      name: 'My New Breakpoint',
      minWidth: 1440,
      maxWidth: 2880,
    }

    data = {
      oldBreakpoints: structuredClone(site.context.breakpoints),
      newBreakpoints: [
        ...Object.values(structuredClone(site.context.breakpoints)),
        newBreakpoint,
      ],
    }
  })

  it('should set breakpoint', () => {
    const breakpointCountBefore = Object.keys(site.context.breakpoints).length

    applySetBreakpoint(site, data)

    const breakpointCountAfter = Object.keys(site.context.breakpoints).length
    expect(breakpointCountAfter).toEqual(breakpointCountBefore + 1)
    expect(Object.values(site.context.breakpoints).map((bp) => bp.name)).toContain(
      newBreakpoint.name,
    )
  })

  it('should set two breakpoints', () => {
    const breakpointCountBefore = Object.keys(site.context.breakpoints).length
    const expectedId1 = breakpointId(
      site.context.namespace,
      site.context.nextId.toString(),
    )
    const expectedId2 = breakpointId(
      site.context.namespace,
      (site.context.nextId + 1).toString(),
    )

    applySetBreakpoint(site, data)
    const data2 = {
      oldBreakpoints: structuredClone(site.context.breakpoints),
      newBreakpoints: [
        ...Object.values(structuredClone(site.context.breakpoints)),
        { id: undefined, name: 'bp2', maxWidth: 700 },
      ],
    }
    applySetBreakpoint(site, data2)

    const breakpointCountAfter = Object.keys(site.context.breakpoints).length
    expect(breakpointCountAfter).toEqual(breakpointCountBefore + 2)

    expect(site.context.breakpoints[expectedId1]?.name).toEqual(newBreakpoint.name)
    expect(site.context.breakpoints[expectedId2]?.name).toEqual('bp2')
  })

  it('should set breakpoint and undo', () => {
    const initialId = site.context.nextId
    applySetBreakpoint(site, data)
    expect(site.context.nextId).toEqual(initialId + 1)
    const breakpointCountBefore = Object.keys(site.context.breakpoints).length

    undoSetBreakpoint(site, data)
    expect(site.context.nextId).toEqual(initialId)

    const breakpointCountAfter = Object.keys(site.context.breakpoints).length
    expect(breakpointCountAfter).toEqual(breakpointCountBefore - 1)
    expect(Object.values(site.context.breakpoints).map((bp) => bp.name)).not.toContain(
      newBreakpoint.name,
    )
  })
})
