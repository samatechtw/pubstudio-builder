import { computeComponentBreakpointStyles } from '@pubstudio/frontend/util-component'
import {
  Css,
  CssPseudoClass,
  IComponent,
  ISiteContext,
} from '@pubstudio/shared/type-site'

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
