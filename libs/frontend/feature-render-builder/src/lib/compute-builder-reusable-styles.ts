import { pseudoClassToCssClass } from '@pubstudio/frontend/feature-render'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { IRawStyleRecord } from '@pubstudio/frontend/util-render'
import { CssPseudoClass, ISite } from '@pubstudio/shared/type-site'

export const computeBuilderReusableStyles = (site: ISite): IRawStyleRecord => {
  const result: IRawStyleRecord = {}

  // Compute target breakpoint ids
  const accumulatedBreakpointIds = new Set<string>([DEFAULT_BREAKPOINT_ID])

  for (const breakpoint of descSortedBreakpoints.value) {
    if (breakpoint.id === activeBreakpoint.value.id) {
      break
    }
    accumulatedBreakpointIds.add(breakpoint.id)
  }

  // Compute styles in the current pseudo class
  const currentPseudoClass = site.editor?.cssPseudoClass ?? CssPseudoClass.Default

  // Compute styles in default pseudo class
  Object.entries(site.context.styles).forEach(([styleId, style]) => {
    accumulatedBreakpointIds.forEach((breakpointId) => {
      const bpStyle = style.breakpoints[breakpointId]
      const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
      result[`.${styleId}`] = { ...rawStyle }

      // Compute styles in the current pseudo class
      if (currentPseudoClass !== CssPseudoClass.Default) {
        const rawStyle = bpStyle?.[currentPseudoClass] ?? {}
        const pseudoClassName = pseudoClassToCssClass(currentPseudoClass)
        result[`.${styleId}.${pseudoClassName}`] = { ...rawStyle }
      }
    })
  })

  return result
}