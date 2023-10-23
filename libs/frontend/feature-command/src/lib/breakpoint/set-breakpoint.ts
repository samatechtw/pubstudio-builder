import { ISetBreakpointData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const applySetBreakpoint = (site: ISite, data: ISetBreakpointData) => {
  site.context.breakpoints = { ...data.newBreakpoints }
}

export const undoSetBreakpoint = (site: ISite, data: ISetBreakpointData) => {
  site.context.breakpoints = { ...data.oldBreakpoints }
}
