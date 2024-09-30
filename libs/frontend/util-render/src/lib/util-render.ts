import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { resolveThemeVariables } from '@pubstudio/frontend/util-resolve'
import {
  CssPseudoClassType,
  CssType,
  IBreakpoint,
  IComponent,
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
        const computedValue = resolveThemeVariables(context, value) ?? value
        const supportedValue = CSS.supports(prop, computedValue) ? computedValue : ''
        return `${prop}:${supportedValue};`
      })
      .join('')
    return `${result}${selector}{${fields}}`
  }, '')
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
  rawStyle: IRawStyle,
): IRawStyle => {
  return Object.entries(rawStyle)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .reduce((result, [css, value]) => {
      result[css as CssType] = resolveThemeVariables(context, value)
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
      result[css as CssType] = resolveThemeVariables(context, source.value)
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

export const sortMixinIds = (context: ISiteContext, component: IComponent): string[] => {
  return (component.style.mixins ?? []).sort((a, b) => {
    const indexA = context.styleOrder.indexOf(a)
    const indexB = context.styleOrder.indexOf(b)
    if (indexA === -1) {
      return 1
    } else if (indexB === -1) {
      return -1
    }
    return indexB - indexA
  })
}

export type MixinIterFn = (
  breakpointId: string,
  pseudoClass: string,
  rawStyle: IRawStyle,
) => void

export const iterateMixin = (context: ISiteContext, mixinId: string, fn: MixinIterFn) => {
  const mixin = context.styles[mixinId]
  Object.entries(mixin.breakpoints ?? {}).forEach(([bpId, pseudoStyle]) => {
    Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
      const pseudoValue =
        (pseudoClass as CssPseudoClassType) === 'default' ? '' : pseudoClass
      fn(bpId, pseudoValue, rawStyle)
    })
  })
}
