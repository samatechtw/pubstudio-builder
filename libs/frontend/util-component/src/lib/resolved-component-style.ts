import {
  Css,
  CssPseudoClass,
  IComponent,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { computeComponentBreakpointStyles } from './compute-component-breakpoint-styles'

export const resolvedComponentStyle = (
  context: ISiteContext,
  component: IComponent | undefined,
  pseudoClass: CssPseudoClass,
  cssProp: Css,
  targetBreakpointId: string,
): string | undefined => {
  if (!component) {
    return undefined
  }
  const breakpointStyles = computeComponentBreakpointStyles(context, component)
  return breakpointStyles[targetBreakpointId]?.[pseudoClass]?.[cssProp]?.value
}
