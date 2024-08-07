import { pseudoClassToCssClass } from '@pubstudio/frontend/feature-render'
import { getActiveBreakpointIds } from '@pubstudio/frontend/feature-site-source'
import { IRawStyleRecord } from '@pubstudio/frontend/util-render'
import { CssPseudoClass, ISite } from '@pubstudio/shared/type-site'

export const computeBuilderMixins = (site: ISite): IRawStyleRecord => {
  const result: IRawStyleRecord = {}

  // Compute styles in the current pseudo class
  const currentPseudo = site.editor?.cssPseudoClass ?? 'default'
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
        if (currentPseudo !== CssPseudoClass.Default) {
          const rawStyle = bpStyle?.[currentPseudo] ?? {}
          const pseudoClassName = pseudoClassToCssClass(currentPseudo)

          const cls = `.${styleId}.${pseudoClassName}`
          const currentStyle = result[cls] ?? {}
          result[cls] = { ...currentStyle, ...rawStyle }
        }
      })
    }
  }

  return result
}
