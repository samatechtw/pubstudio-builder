import {
  computeCustomBreakpointStyles,
  computeMixinBreakpointStyles,
  createQueryStyle,
  IQueryStyle,
  IRawStyleRecord,
  IResolvedPageStyle,
  iterateMixin,
  iteratePage,
  mergeBreakpointStylesWithSource,
  rawStyleToResolvedStyle,
  rawStyleToResolvedStyleWithSource,
  sortMixinIds,
} from '@pubstudio/frontend/util-render'
import {
  CssPseudoClassType,
  CssType,
  IComponent,
  IPage,
  IRawStyle,
  ISiteContext,
} from '@pubstudio/shared/type-site'

export const getRootBackgroundStyle = (
  context: ISiteContext,
  page: IPage,
): IQueryStyle => {
  const queryStyle = createQueryStyle(context)
  const breakpointStyles = mergeBreakpointStylesWithSource(
    computeMixinBreakpointStyles(context, page.root.style.mixins),
    computeCustomBreakpointStyles(page.root),
  )

  for (const breakpointId in context.breakpoints) {
    const pseudoStyle = breakpointStyles[breakpointId]
    if (pseudoStyle) {
      Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
        const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
        const filteredStyle: IRawStyle = {}
        if (resolvedStyle['background']) {
          filteredStyle['background'] = resolvedStyle['background']
        }
        if (resolvedStyle['background-color']) {
          filteredStyle['background-color'] = resolvedStyle['background-color']
        }
        const pseudoValue =
          (pseudoClass as CssPseudoClassType) === 'default' ? '' : pseudoClass
        queryStyle[breakpointId][`html${pseudoValue}`] = filteredStyle
      })
    }
  }
  return queryStyle
}

const computeComponentcustomStyle = (
  context: ISiteContext,
  styles: IQueryStyle,
  component: IComponent,
) => {
  const reusableMixins = sortMixinIds(context, component)
  // Accumulate all mixin styles, following `context.styleOrder`
  for (const mixinId of reusableMixins) {
    iterateMixin(context, mixinId, (bpId, pseudoClass, rawStyle) => {
      const styleAcc = styles[bpId][`.${component.id}${pseudoClass}`]
      if (styleAcc) {
        for (const [css, value] of Object.entries(rawStyle)) {
          if (!styleAcc[css as CssType]) {
            styleAcc[css as CssType] = value
          }
        }
      } else {
        styles[bpId][`.${component.id}${pseudoClass}`] = rawStyle
      }
    })
  }
}

export const getLivePageStyle = (
  context: ISiteContext,
  page: IPage,
): IResolvedPageStyle => {
  const queryStyle = createQueryStyle(context)
  const customStyle = createQueryStyle(context)

  const appendStyle = (component: IComponent) => {
    const isCustom =
      context.customComponentIds.has(component.id) ||
      context.customChildIds.has(component.id)

    for (const breakpointId in context.breakpoints) {
      const pseudoStyle = component.style.custom[breakpointId]
      if (pseudoStyle) {
        Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
          const pseudoValue =
            (pseudoClass as CssPseudoClassType) === 'default' ? '' : pseudoClass
          const selector = `.${component.id}${pseudoValue}`
          if (isCustom) {
            customStyle[breakpointId][selector] = rawStyle
          } else {
            const resolvedStyle = rawStyleToResolvedStyle(context, rawStyle)
            queryStyle[breakpointId][selector] = resolvedStyle
          }
        })
      }
      const overrideStyles = component.style.overrides
      if (overrideStyles) {
        Object.entries(overrideStyles).forEach(([selector, breakpointStyles]) => {
          const selectorStyles = breakpointStyles[breakpointId]
          if (breakpointStyles[breakpointId]) {
            Object.entries(selectorStyles).forEach(([pseudoClass, rawStyle]) => {
              const pseudoValue =
                (pseudoClass as CssPseudoClassType) === 'default' ? '' : pseudoClass
              const cssSelector = `.${component.id}${pseudoValue} .${selector}`

              if (isCustom) {
                customStyle[breakpointId][cssSelector] = rawStyle
              } else {
                const resolvedStyle = rawStyleToResolvedStyle(context, rawStyle)
                queryStyle[breakpointId][cssSelector] = resolvedStyle
              }
            })
          }
        })
      }
    }
    if (isCustom) {
      // Merge custom component mixin styles
      computeComponentcustomStyle(context, customStyle, component)
    }
  }
  iteratePage(page, appendStyle)

  // Resolve merged styles
  for (const pseudoStyle of Object.values(customStyle)) {
    for (const [selector, rawStyle] of Object.entries(pseudoStyle)) {
      pseudoStyle[selector] = rawStyleToResolvedStyle(context, rawStyle)
    }
  }

  const sortedQueryStyle = sortQueryStyle(queryStyle)
  const sortedcustomStyle = sortQueryStyle(customStyle)

  return {
    component: sortedQueryStyle,
    custom: sortedcustomStyle,
  }
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

export const sortRawStyleRecord = (rawStyleRecord: IRawStyleRecord): IRawStyleRecord => {
  return Object.entries(rawStyleRecord).reduce((result, [selector, rawStyle]) => {
    result[selector] = sortRawStyle(rawStyle)
    return result
  }, {} as IRawStyleRecord)
}

// Order raw style by properties so that -webkit CSS properties are always at the end.
// This is necessary in some cases, for example, for gradient
// background color to work, `-webkit-background-clip: text` should always be after
// `background`.
const sortRawStyle = (rawStyle: IRawStyle): IRawStyle => {
  return Object.entries(rawStyle)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .reduce((result, [property, value]) => {
      result[property as CssType] = value
      return result
    }, {} as IRawStyle)
}
