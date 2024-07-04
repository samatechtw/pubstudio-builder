import {
  pseudoClassToCssClass,
  sortRawStyleRecord,
} from '@pubstudio/frontend/feature-render'
import { getActiveBreakpointIds } from '@pubstudio/frontend/feature-site-source'
import {
  IRawStyleRecord,
  iteratePage,
  sortMixinIds,
} from '@pubstudio/frontend/util-render'
import {
  Css,
  CssPseudoClass,
  IComponent,
  IPage,
  IPseudoStyle,
  IRawStyle,
  ISite,
} from '@pubstudio/shared/type-site'

const computeMixinStyles = (
  mixinPseudo: IPseudoStyle,
  pseudoClass: CssPseudoClass,
  styleAcc: IRawStyle,
): IRawStyle => {
  const mixinStyles = mixinPseudo?.[pseudoClass] ?? {}
  if (styleAcc) {
    for (const [css, value] of Object.entries(mixinStyles)) {
      if (!styleAcc[css as Css]) {
        styleAcc[css as Css] = value
      }
    }
    return styleAcc
  } else {
    return mixinStyles
  }
}

interface IResolvedBuildPageStyle {
  component: IRawStyleRecord
  custom: IRawStyleRecord
}

export const getBuildPageStyle = (site: ISite, page: IPage): IResolvedBuildPageStyle => {
  const pageStyle: IRawStyleRecord = {}
  const customStyle: IRawStyleRecord = {}
  const accumulatedBreakpointIds = getActiveBreakpointIds()

  const appendStyle = (component: IComponent) => {
    const isCustom =
      site.context.customComponentIds.has(component.id) ||
      site.context.customChildIds.has(component.id)
    const curPseudo = site.editor?.cssPseudoClass ?? CssPseudoClass.Default

    const styleRecord = isCustom ? customStyle : pageStyle

    // Compute default styles
    accumulatedBreakpointIds.forEach((breakpointId) => {
      const bpStyle = component.style.custom[breakpointId]
      const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
      const cls = `.${component.id}`
      styleRecord[cls] = { ...styleRecord[cls], ...rawStyle }

      // Compute styles in the current pseudo class
      let pseudoCls: string | undefined
      if (curPseudo !== CssPseudoClass.Default) {
        const rawStyle = bpStyle?.[curPseudo] ?? {}
        const pseudoClassName = pseudoClassToCssClass(curPseudo)
        pseudoCls = `.${component.id}.${pseudoClassName}`
        styleRecord[pseudoCls] = { ...styleRecord[pseudoCls], ...rawStyle }
      }

      if (isCustom) {
        const reusableMixins = sortMixinIds(site.context, component)
        // Accumulate all mixin styles, following `context.styleOrder`
        for (const mixinId of reusableMixins) {
          const mixinPseudo = site.context.styles[mixinId]?.breakpoints?.[breakpointId]
          // Compute default mixin styles
          styleRecord[cls] = computeMixinStyles(
            mixinPseudo,
            CssPseudoClass.Default,
            styleRecord[cls],
          )
          // Compute mixin styles in the current pseudo class
          if (pseudoCls && curPseudo !== CssPseudoClass.Default) {
            styleRecord[pseudoCls] = computeMixinStyles(
              mixinPseudo,
              curPseudo,
              styleRecord[pseudoCls],
            )
          }
        }
      }
    })

    if (component.style.overrides) {
      Object.entries(component.style.overrides).forEach(
        ([selector, breakpointStyles]) => {
          // Compute styles in default pseudo class
          accumulatedBreakpointIds.forEach((breakpointId) => {
            const bpStyle = breakpointStyles[breakpointId]
            const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
            styleRecord[`.${component.id} .${selector}`] = { ...rawStyle }

            // Compute styles in the current pseudo class
            if (curPseudo !== CssPseudoClass.Default) {
              const rawStyle = bpStyle?.[curPseudo] ?? {}
              const pseudoClassName = pseudoClassToCssClass(curPseudo)
              styleRecord[`.${component.id} .${selector}.${pseudoClassName}`] = {
                ...rawStyle,
              }
            }
          })
        },
      )
    }
  }
  iteratePage(page, appendStyle)

  const sortedPageStyle = sortRawStyleRecord(pageStyle)
  const sortedCustomStyle = sortRawStyleRecord(customStyle)

  return {
    component: sortedPageStyle,
    custom: sortedCustomStyle,
  }
}
