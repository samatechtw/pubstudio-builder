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
