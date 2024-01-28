import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { breakpointSortFn } from '@pubstudio/frontend/util-render'
import { IBreakpointStyles, IPseudoStyle } from '@pubstudio/shared/type-site'
import { computed } from 'vue'
import { site } from './site-source'

// Sorts breakpoints from small to large
export const sortedBreakpoints = computed(() =>
  Object.values(site.value.context.breakpoints).sort(breakpointSortFn),
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

// Get an array of the breakpoint IDs that are currently applied
export const getActiveBreakpointIds = (): string[] => {
  // Compute target breakpoint ids
  const accumulatedBreakpointIds = [DEFAULT_BREAKPOINT_ID]
  for (const breakpoint of descSortedBreakpoints.value) {
    if (breakpoint.id !== DEFAULT_BREAKPOINT_ID) {
      accumulatedBreakpointIds.push(breakpoint.id)
    }
    if (breakpoint.id === activeBreakpoint.value.id) {
      break
    }
  }
  return accumulatedBreakpointIds
}
