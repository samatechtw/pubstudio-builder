import {
  editStylesSwitchMode,
  setBuilderWidth,
} from '@pubstudio/frontend/data-access-command'
import {
  activeBreakpoint,
  sortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { IBreakpoint } from '@pubstudio/shared/type-site'
import { ComputedRef } from 'vue'

export interface IUseBreakpoint {
  breakpoints: ComputedRef<IBreakpoint[]>
  activeBreakpoint: ComputedRef<IBreakpoint>
  applyBreakpoint: (breakpoint: IBreakpoint) => void
}

export const useBreakpoint = (): IUseBreakpoint => {
  const { site, editor } = useSiteSource()

  const applyBreakpoint = (breakpoint: IBreakpoint) => {
    if (activeBreakpoint.value.id === breakpoint.id) {
      return
    }
    const { minWidth, maxWidth } = breakpoint

    editStylesSwitchMode(site.value)

    if (minWidth !== undefined || maxWidth !== undefined) {
      setBuilderWidth(editor.value, (maxWidth ?? minWidth) as number)
    } else {
      // Get max of all breakpoint sizes and current builder window width
      // Otherwise it's impossible to select the default breakpoint when the builder width
      // is less than another breakpoint's min/max width
      const width = sortedBreakpoints.value.reduce((prev, cur) => {
        const size = (cur.maxWidth ?? cur.minWidth ?? 0) + 1
        return Math.max(prev, size)
      }, builderContext.buildContentWindowSize.value.width)
      setBuilderWidth(editor.value, width)
    }
  }

  return {
    breakpoints: sortedBreakpoints,
    activeBreakpoint,
    applyBreakpoint,
  }
}
