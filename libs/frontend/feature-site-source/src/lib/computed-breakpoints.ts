import { IBreakpointStyles, IPseudoStyle } from '@pubstudio/shared/type-site'
import { computed } from 'vue'
import { site } from './site-source'

// Sorts breakpoints from small to large
export const sortedBreakpoints = computed(() =>
  Object.values(site.value.context.breakpoints).sort((a, b) => {
    if (a.maxWidth === undefined && b.maxWidth === undefined) {
      return 0
    } else if (a.maxWidth === undefined) {
      return 1
    } else if (b.maxWidth === undefined) {
      return -1
    } else {
      return a.maxWidth - b.maxWidth
    }
  }),
)

export const descSortedBreakpoints = computed(() =>
  // Create a shallow copy to prevent `reverse` from influencing the original array
  [...sortedBreakpoints.value].reverse(),
)

export const activeBreakpoint = computed(() => {
  const builderWidth = site.value.editor?.builderWidth ?? 0
  // Default to the largest breakpoint
  let matchedBreakpoint = sortedBreakpoints.value[sortedBreakpoints.value.length - 1]

  for (const breakpoint of sortedBreakpoints.value) {
    const { minWidth, maxWidth } = breakpoint
    if (
      // Builder width is between min & max
      (minWidth !== undefined &&
        maxWidth !== undefined &&
        minWidth <= builderWidth &&
        builderWidth <= maxWidth) ||
      // Builder width is less than max
      (maxWidth !== undefined && builderWidth <= maxWidth) ||
      // Builder width is greater than min
      (minWidth !== undefined && minWidth <= builderWidth)
    ) {
      matchedBreakpoint = breakpoint
      break
    }
  }

  return matchedBreakpoint
})

export const getActiveBreakpointStyle = (styles: IBreakpointStyles): IPseudoStyle =>
  styles[activeBreakpoint.value.id] ?? {}
