import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import {
  Css,
  IBreakpoint,
  IRawStyle,
  IRawStylesWithSource,
  ISiteContext,
  ITheme,
  IThemeFont,
} from '@pubstudio/shared/type-site'
import { breakpointSortFn } from './sort-breakpoint-fn'
import { IQueryStyle, IRawStyleRecord } from './util-render-types'

export const rawStyleRecordToString = (
  record: IRawStyleRecord,
  context: ISiteContext,
): string => {
  return Object.entries(record).reduce((result, [selector, rawStyle]) => {
    const fields = Object.entries(rawStyle)
      .map(([prop, value]) => {
        const computedValue = computeCssValue(prop as Css, value, context)
        const supportedValue = CSS.supports(prop, computedValue) ? computedValue : ''
        return `${prop}:${supportedValue};`
      })
      .join('')
    return `${result}${selector}{${fields}}`
  }, '')
}

const computeCssValue = (prop: Css, value: string, context: ISiteContext): string => {
  let computedValue = resolveThemeVariables(context, value) ?? value

  if (prop === Css.FontFamily) {
    const appliedFont: IThemeFont | undefined = context.theme.fonts[value]
    if (appliedFont?.fallback) {
      computedValue = `"${appliedFont.name}", "${appliedFont.fallback}", sans-serif`
    }
  }

  return computedValue
}

export const createQueryStyle = (context: ISiteContext): IQueryStyle => {
  const result: IQueryStyle = {}
  for (const breakpointId in context.breakpoints) {
    result[breakpointId] = {}
  }
  return result
}

export const queryStyleToString = (
  context: ISiteContext,
  queryStyle: IQueryStyle,
): string => {
  let styleContent = ''
  Object.entries(context.breakpoints)
    .sort((bp1, bp2) => {
      if (bp1[0] === DEFAULT_BREAKPOINT_ID) {
        return 1
      } else if (bp2[0] === DEFAULT_BREAKPOINT_ID) {
        return -1
      }
      return breakpointSortFn(bp1[1], bp2[1])
    })
    .reverse()
    .forEach(([breakpointId, breakpoint]) => {
      const rawStyle = rawStyleRecordToString(queryStyle[breakpointId], context)
      if (breakpointId === DEFAULT_BREAKPOINT_ID) {
        styleContent += rawStyle
      } else {
        const mediaQuery = getMediaQuery(breakpoint)
        styleContent += `@media ${mediaQuery} {${rawStyle}}`
      }
    })
  return styleContent
}

const getMediaQuery = (breakpoint: IBreakpoint): string => {
  const { minWidth, maxWidth } = breakpoint
  const minWidthQuery = minWidth !== undefined ? `(min-width: ${minWidth}px)` : ''
  const maxWidthQuery = maxWidth !== undefined ? `(max-width: ${maxWidth}px)` : ''
  return [minWidthQuery, maxWidthQuery].filter((value) => value).join(' and ')
}

export const rawStyleToResolvedStyle = (
  context: ISiteContext,
  rawStyleWithSource: IRawStyle,
): IRawStyle => {
  return Object.entries(rawStyleWithSource)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .reduce((result, [css, value]) => {
      result[css as Css] = resolveThemeVariables(context, value)
      return result
    }, {} as IRawStyle)
}

export const rawStyleToResolvedStyleWithSource = (
  context: ISiteContext,
  rawStyleWithSource: IRawStylesWithSource,
): IRawStyle => {
  return Object.entries(rawStyleWithSource)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .reduce((result, [css, source]) => {
      result[css as Css] = resolveThemeVariables(context, source.value)
      return result
    }, {} as IRawStyle)
}

export const themeToCssVars = (theme: ITheme): string => {
  const themeVars = Object.entries(theme.variables)
    .map(([name, val]) => {
      return `--${name}:${val};`
    })
    .join('')
  return `:root{${themeVars}}`
}
