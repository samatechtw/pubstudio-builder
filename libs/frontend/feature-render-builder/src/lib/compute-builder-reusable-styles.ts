import { pseudoClassToCssClass } from '@pubstudio/frontend/feature-render'
import { getActiveBreakpointIds } from '@pubstudio/frontend/feature-site-source'
import { IRawStyleRecord } from '@pubstudio/frontend/util-render'
import { CssPseudoClass, ISite } from '@pubstudio/shared/type-site'

export const computeBuilderReusableStyles = (site: ISite): IRawStyleRecord => {
  const result: IRawStyleRecord = {}

  // Compute styles in the current pseudo class
  const currentPseudoClass = site.editor?.cssPseudoClass ?? CssPseudoClass.Default
  const accumulatedBreakpointIds = getActiveBreakpointIds()

  // Compute styles in default pseudo class
  for (const styleId of site.context.styleOrder) {
    const style = site.context.styles[styleId]
    if (style) {
      accumulatedBreakpointIds.forEach((breakpointId) => {
        const bpStyle = style.breakpoints[breakpointId]
        const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
        const cls = `.${styleId}`
        const currentStyle = result[cls] ?? {}
        result[cls] = { ...currentStyle, ...rawStyle }

        // Compute styles in the current pseudo class
        if (currentPseudoClass !== CssPseudoClass.Default) {
          const rawStyle = bpStyle?.[currentPseudoClass] ?? {}
          const pseudoClassName = pseudoClassToCssClass(currentPseudoClass)

          const cls = `.${styleId}.${pseudoClassName}`
          const currentStyle = result[cls] ?? {}
          result[cls] = { ...currentStyle, ...rawStyle }
        }
      })
    }
  }

  return result
}
