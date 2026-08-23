import {
  IBreakpointStyles,
  IComponentStyleOverrides,
  IPseudoStyle,
} from '@pubstudio/shared/type-site'
import { clone } from './detach-component'

// Combines two style records, property by property, with `over` winning conflicts
export const mergeBreakpointStyles = (
  base: IBreakpointStyles | undefined,
  over: IBreakpointStyles | undefined,
): IBreakpointStyles => {
  const result: IBreakpointStyles = clone(base) ?? {}
  for (const [breakpointId, pseudoStyle] of Object.entries(over ?? {})) {
    const merged: IPseudoStyle = result[breakpointId] ?? {}
    for (const [pseudoClass, rawStyle] of Object.entries(pseudoStyle)) {
      merged[pseudoClass as keyof IPseudoStyle] = {
        ...merged[pseudoClass as keyof IPseudoStyle],
        ...rawStyle,
      }
    }
    result[breakpointId] = merged
  }
  return result
}

export const mergeStyleOverrides = (
  base: IComponentStyleOverrides | undefined,
  over: IComponentStyleOverrides | undefined,
): IComponentStyleOverrides | undefined => {
  if (!base && !over) {
    return undefined
  }
  const result: IComponentStyleOverrides = clone(base) ?? {}
  for (const [selector, styles] of Object.entries(over ?? {})) {
    result[selector] = mergeBreakpointStyles(result[selector], styles)
  }
  return result
}
