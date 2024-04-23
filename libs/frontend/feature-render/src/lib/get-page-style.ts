import { getActiveBreakpointIds } from '@pubstudio/frontend/feature-site-source'
import {
  computeComponentBreakpointStyles,
  computeComponentOverrideStyles,
} from '@pubstudio/frontend/util-component'
import {
  createQueryStyle,
  IQueryStyle,
  IRawStyleRecord,
  iteratePage,
  rawStyleToResolvedStyleWithSource,
} from '@pubstudio/frontend/util-render'
import {
  Css,
  CssPseudoClass,
  IComponent,
  IPage,
  IRawStyle,
  ISite,
  ISiteContext,
} from '@pubstudio/shared/type-site'
import { pseudoClassToCssClass } from './pseudo-class-to-css-class'

export const getBuildPageStyle = (site: ISite, page: IPage): IRawStyleRecord => {
  const pageStyle: IRawStyleRecord = {}
  const accumulatedBreakpointIds = getActiveBreakpointIds()

  const appendStyle = (component: IComponent) => {
    const currentPseudoClass = site.editor?.cssPseudoClass ?? CssPseudoClass.Default

    // Compute styles in default pseudo class
    accumulatedBreakpointIds.forEach((breakpointId) => {
      const bpStyle = component.style.custom[breakpointId]
      const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
      const cls = `.${component.id}`
      const style = pageStyle[cls] ?? {}
      pageStyle[cls] = { ...style, ...rawStyle }

      // Compute styles in the default and current pseudo class
      if (currentPseudoClass !== CssPseudoClass.Default) {
        const rawStyle = bpStyle?.[currentPseudoClass] ?? {}
        const pseudoClassName = pseudoClassToCssClass(currentPseudoClass)
        const cls = `.${component.id}.${pseudoClassName}`
        const style = pageStyle[cls] ?? {}
        pageStyle[cls] = { ...style, ...rawStyle }
      }
    })

    if (component.style.overrides) {
      Object.entries(component.style.overrides).forEach(
        ([selector, breakpointStyles]) => {
          // Compute styles in default pseudo class
          accumulatedBreakpointIds.forEach((breakpointId) => {
            const bpStyle = breakpointStyles[breakpointId]
            const rawStyle = bpStyle?.[CssPseudoClass.Default] ?? {}
            pageStyle[`.${component.id} .${selector}`] = { ...rawStyle }

            // Compute styles in the current pseudo class
            if (currentPseudoClass !== CssPseudoClass.Default) {
              const rawStyle = bpStyle?.[currentPseudoClass] ?? {}
              const pseudoClassName = pseudoClassToCssClass(currentPseudoClass)
              pageStyle[`.${component.id} .${selector}.${pseudoClassName}`] = {
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

  return sortedPageStyle
}

export const getRootBackgroundStyle = (
  context: ISiteContext,
  page: IPage,
): IQueryStyle => {
  const queryStyle = createQueryStyle(context)
  const breakpointStyles = computeComponentBreakpointStyles(context, page.root, {
    computeMixins: true,
  })
  for (const breakpointId in context.breakpoints) {
    const pseudoStyle = breakpointStyles[breakpointId]
    if (pseudoStyle) {
      Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
        const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
        const filteredStyle: IRawStyle = {}
        if (resolvedStyle[Css.Background]) {
          filteredStyle[Css.Background] = resolvedStyle[Css.Background]
        }
        if (resolvedStyle[Css.BackgroundColor]) {
          filteredStyle[Css.BackgroundColor] = resolvedStyle[Css.BackgroundColor]
        }
        const pseudoValue = pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
        queryStyle[breakpointId][`html${pseudoValue}`] = filteredStyle
      })
    }
  }
  return queryStyle
}

export const getLivePageStyle = (context: ISiteContext, page: IPage): IQueryStyle => {
  const queryStyle = createQueryStyle(context)

  const appendStyle = (component: IComponent) => {
    const breakpointStyles = computeComponentBreakpointStyles(context, component, {
      // Ignore mixins because they're already handled by Reusable Styles in renderer.
      computeMixins: false,
    })
    const overrideStyles = computeComponentOverrideStyles(component)
    for (const breakpointId in context.breakpoints) {
      const pseudoStyle = breakpointStyles[breakpointId]
      if (pseudoStyle) {
        Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
          const pseudoValue = pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
          const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
          queryStyle[breakpointId][`.${component.id}${pseudoValue}`] = resolvedStyle
        })
      }
      if (overrideStyles && overrideStyles[breakpointId]) {
        Object.entries(overrideStyles[breakpointId]).forEach(
          ([selector, selectorStyles]) => {
            Object.entries(selectorStyles).forEach(([pseudoClass, rawStyle]) => {
              const pseudoValue =
                pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
              const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
              queryStyle[breakpointId][`.${component.id}${pseudoValue} .${selector}`] =
                resolvedStyle
            })
          },
        )
      }
    }
  }
  iteratePage(page, appendStyle)

  const sortedQueryStyle = sortQueryStyle(queryStyle)

  return sortedQueryStyle
}

export const getGlobalStyle = (context: ISiteContext): string => {
  return Object.values(context.globalStyles ?? {}).reduce(
    (prev, cur) => prev + cur.style,
    '',
  )
}

const sortQueryStyle = (queryStyle: IQueryStyle): IQueryStyle => {
  return Object.entries(queryStyle).reduce((result, [breakpointId, rawStyleRecord]) => {
    result[breakpointId] = sortRawStyleRecord(rawStyleRecord)
    return result
  }, {} as IQueryStyle)
}

const sortRawStyleRecord = (rawStyleRecord: IRawStyleRecord): IRawStyleRecord => {
  return Object.entries(rawStyleRecord).reduce((result, [selector, rawStyle]) => {
    result[selector] = sortRawStyle(rawStyle)
    return result
  }, {} as IRawStyleRecord)
}

// Order raw style by properties so that -webkit CSS properties would always
// be added at the end. This is necessary in some cases, for example, for gradient
// background color to work, `-webkit-background-clip: text` should always be after
// `background`.
const sortRawStyle = (rawStyle: IRawStyle): IRawStyle => {
  return Object.entries(rawStyle)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .reduce((result, [property, value]) => {
      result[property as Css] = value
      return result
    }, {} as IRawStyle)
}
