import { nextBreakpointId } from '@pubstudio/frontend/util-ids'
import { deserializeSite } from '@pubstudio/frontend/util-site-deserialize'
import { mockSerializedSite } from '@pubstudio/frontend/util-test-mock'
import { ISetBreakpointData } from '@pubstudio/shared/type-command-data'
import { IBreakpoint, ISite } from '@pubstudio/shared/type-site'
import { applySetBreakpoint, undoSetBreakpoint } from './set-breakpoint'

describe('Set Breakpoint', () => {
  let siteString: string
  let site: ISite

  let newBreakpoint: IBreakpoint
  let data: ISetBreakpointData

  beforeEach(() => {
    siteString = JSON.stringify(mockSerializedSite)
    site = deserializeSite(siteString) as ISite

    const newBreakpointId = nextBreakpointId(site.context)
    newBreakpoint = {
      id: newBreakpointId,
      name: 'My New Breakpoint',
      minWidth: 1440,
      maxWidth: 2880,
    }

    data = {
      oldBreakpoints: structuredClone(site.context.breakpoints),
      newBreakpoints: {
        ...structuredClone(site.context.breakpoints),
        [newBreakpoint.id]: newBreakpoint,
      },
    }
  })

  it('should set breakpoint', () => {
    const breakpointCountBefore = Object.keys(site.context.breakpoints).length
    expect(newBreakpoint.id in site.context.breakpoints).toEqual(false)

    applySetBreakpoint(site, data)

    const breakpointCountAfter = Object.keys(site.context.breakpoints).length
    expect(breakpointCountAfter).toEqual(breakpointCountBefore + 1)
    expect(newBreakpoint.id in site.context.breakpoints).toEqual(true)
  })

  it('should set breakpoint and undo', () => {
    applySetBreakpoint(site, data)
    const breakpointCountBefore = Object.keys(site.context.breakpoints).length

    undoSetBreakpoint(site, data)

    const breakpointCountAfter = Object.keys(site.context.breakpoints).length
    expect(breakpointCountAfter).toEqual(breakpointCountBefore - 1)
    expect(newBreakpoint.id in site.context.breakpoints).toEqual(false)
  })
})
