import { nextBreakpointId } from '@pubstudio/frontend/util-ids'
import { ISetBreakpointData } from '@pubstudio/shared/type-command-data'
import { ISite } from '@pubstudio/shared/type-site'

export const applySetBreakpoint = (site: ISite, data: ISetBreakpointData) => {
  const newBreakpoints = data.newBreakpoints.map((bp) => {
    const newBp = { ...bp }
    if (!newBp.id) {
      newBp.id = nextBreakpointId(site.context)
    }
    if (!newBp.name) {
      newBp.name = newBp.id
    }
    return [bp.id, newBp]
  })
  site.context.breakpoints = Object.fromEntries(newBreakpoints)
}

export const undoSetBreakpoint = (site: ISite, data: ISetBreakpointData) => {
  for (const bp of data.newBreakpoints) {
    if (!bp.id) {
      site.context.nextId -= 1
    }
  }
  site.context.breakpoints = { ...data.oldBreakpoints }
}
