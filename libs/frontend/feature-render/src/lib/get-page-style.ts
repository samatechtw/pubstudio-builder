import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import {
  computeComponentBreakpointStyles,
  computeComponentFlattenedStyles,
} from '@pubstudio/frontend/util-component'
import {
  createQueryStyle,
  IQueryStyle,
  IRawStyleRecord,
  rawStyleToResolvedStyleWithSource,
} from '@pubstudio/frontend/util-render'
import {
  CssPseudoClass,
  IComponent,
  IPage,
  ISite,
  ISiteContext,
} from '@pubstudio/shared/type-site'

export const getBuildPageStyle = (site: ISite, page: IPage): IRawStyleRecord => {
  const pageStyle: IRawStyleRecord = {}

  const appendStyle = (component: IComponent) => {
    const breakpointStyles = computeComponentBreakpointStyles(site.context, component, {
      // Ignore mixins because they're already handled by Reusable Styles in renderer.
      computeMixins: false,
    })
    const flattenedStyles = computeComponentFlattenedStyles(
      site.editor,
      breakpointStyles,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
    const resolvedStyle = rawStyleToResolvedStyleWithSource(site.context, flattenedStyles)
    pageStyle[`#${component.id}`] = resolvedStyle

    // Children
    component.children?.forEach(appendStyle)
  }

  appendStyle(page.root)

  return pageStyle
}

export const getLivePageStyle = (context: ISiteContext, page: IPage): IQueryStyle => {
  const queryStyle = createQueryStyle(context)

  const appendStyle = (component: IComponent) => {
    const breakpointStyles = computeComponentBreakpointStyles(context, component, {
      // Ignore mixins because they're already handled by Reusable Styles in renderer.
      computeMixins: false,
    })
    for (const breakpointId in context.breakpoints) {
      const pseudoStyle = breakpointStyles[breakpointId]
      if (pseudoStyle) {
        Object.entries(pseudoStyle).forEach(([pseudoClass, rawStyle]) => {
          const pseudoValue = pseudoClass === CssPseudoClass.Default ? '' : pseudoClass
          const resolvedStyle = rawStyleToResolvedStyleWithSource(context, rawStyle)
          queryStyle[breakpointId][`#${component.id}${pseudoValue}`] = resolvedStyle
        })
      }
    }

    // Children
    component.children?.forEach(appendStyle)
  }

  appendStyle(page.root)

  return queryStyle
}
