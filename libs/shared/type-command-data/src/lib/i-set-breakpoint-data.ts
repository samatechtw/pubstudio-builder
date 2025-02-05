import { IBreakpoint } from '@pubstudio/shared/type-site'

export interface IAddBreakpoint extends Omit<IBreakpoint, 'id' | 'name'> {
  id?: string
  name?: string
}

export interface ISetBreakpointData {
  oldBreakpoints: Record<string, IBreakpoint>
  newBreakpoints: IAddBreakpoint[]
}
