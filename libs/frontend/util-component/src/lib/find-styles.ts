import {
  Css,
  IBreakpoint,
  IComponent,
  IRawStyle,
  IReusableComponent,
  ISite,
} from '@pubstudio/shared/type-site'
import { computeComponentBreakpointStyles } from './compute-component-breakpoint-styles'
import { computeFlattenedStyles } from './compute-component-flattened-styles'

export const findStyles = (
  finds: Css[],
  site: ISite,
  component: IComponent | IReusableComponent,
  descSortedBreakpoints: IBreakpoint[],
  activeBreakpoint: IBreakpoint,
): IRawStyle => {
  const result: IRawStyle = {}
  const breakpointStyles = computeComponentBreakpointStyles(site.context, component)
  const flattenedStyles = computeFlattenedStyles(
    site.editor,
    breakpointStyles,
    descSortedBreakpoints,
    activeBreakpoint,
  )
  for (const css of finds) {
    if (css in flattenedStyles) {
      result[css] = flattenedStyles[css]?.value
    }
  }
  return result
}
