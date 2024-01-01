import {
  activeBreakpoint,
  sortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import { setBuilderWidth } from '@pubstudio/frontend/util-command'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { IBreakpoint, IEditorContext } from '@pubstudio/shared/type-site'
import { ComputedRef } from 'vue'

export interface IUseBreakpoint {
  breakpoints: ComputedRef<IBreakpoint[]>
  activeBreakpoint: ComputedRef<IBreakpoint>
  applyBreakpoint: (breakpoint: IBreakpoint) => void
}

export const useBreakpoint = (
  editor: ComputedRef<IEditorContext | undefined>,
): IUseBreakpoint => {
  const applyBreakpoint = (breakpoint: IBreakpoint) => {
    const { minWidth, maxWidth } = breakpoint

    if (minWidth !== undefined || maxWidth !== undefined) {
      setBuilderWidth(editor.value, (maxWidth ?? minWidth) as number)
    } else {
      // Get max of all breakpoint sizes and current builder window width
      // Otherwise it's impossible to select the default breakpoint when the builder width
      // is less than another breakpoint's min/max width
      const width = sortedBreakpoints.value.reduce((prev, cur) => {
        const size = (cur.maxWidth ?? cur.minWidth ?? 0) + 1
        return Math.max(prev, size)
      }, runtimeContext.buildContentWindowSize.value.width)
      setBuilderWidth(editor.value, width)
    }
  }

  return {
    breakpoints: sortedBreakpoints,
    activeBreakpoint,
    applyBreakpoint,
  }
}
