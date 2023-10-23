import { IBreakpoint } from '@pubstudio/shared/type-site'

export interface ISetBreakpointData {
  oldBreakpoints: Record<string, IBreakpoint>
  newBreakpoints: Record<string, IBreakpoint>
}
