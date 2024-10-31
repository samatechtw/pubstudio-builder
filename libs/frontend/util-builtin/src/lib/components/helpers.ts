import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-defaults'
import {
  ComponentArgPrimitive,
  IBreakpointStyles,
  IComponentInput,
  IRawStyle,
} from '@pubstudio/shared/type-site'

export const makeInput = (
  name: string,
  text: string,
  isAttr?: boolean,
): IComponentInput => {
  return {
    type: ComponentArgPrimitive.String,
    name,
    attr: isAttr ?? true,
    default: '',
    is: text,
  }
}

export const defaultStyle = (raw: IRawStyle): IBreakpointStyles => {
  return {
    [DEFAULT_BREAKPOINT_ID]: {
      default: raw,
    },
  }
}
