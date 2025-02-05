import { sortedBreakpoints } from '@pubstudio/frontend/feature-site-source'
import { IAddBreakpoint } from '@pubstudio/shared/type-command-data'
import { IBreakpoint } from '@pubstudio/shared/type-site'
import { computed, ref, Ref, toRaw } from 'vue'

export interface IUseEditBreakpoints {
  breakpoints: Ref<IBreakpoint[]>
  errorKeys: Ref<string[]>
  initBreakpoints: () => void
  addBreakpoint: () => void
  updateMinWidth: (index: number, value: string) => void
  updateMaxWidth: (index: number, value: string) => void
}

interface BreakpointRange {
  minWidth: number
  maxWidth: number
}

const breakpoints = ref<IAddBreakpoint[]>([])

const errorKeys = computed<string[]>(() => {
  const ranges: BreakpointRange[] = []
  // Used for uniqueness check
  const hashedRanges = new Set<string>()

  return breakpoints.value.map((breakpoint) => {
    if (!breakpoint.name) {
      return 'build.breakpoint.errors.name_required'
    } else if (breakpoint.minWidth !== undefined && breakpoint.minWidth <= 0) {
      return 'build.breakpoint.errors.min_width'
    } else if (breakpoint.maxWidth !== undefined && breakpoint.maxWidth <= 0) {
      return 'build.breakpoint.errors.max_width'
    } else if (ranges.some((range) => isBetweenRange(range, breakpoint))) {
      return 'build.breakpoint.errors.overlapped'
    }

    if (breakpoint.minWidth !== undefined && breakpoint.maxWidth !== undefined) {
      ranges.push({
        minWidth: breakpoint.minWidth,
        maxWidth: breakpoint.maxWidth,
      })
    }

    const hashedRange = `${breakpoint.minWidth}-${breakpoint.maxWidth}`
    if (hashedRanges.has(hashedRange)) {
      return 'build.breakpoint.errors.width_unique'
    } else {
      hashedRanges.add(hashedRange)
    }

    return ''
  })
})

const isBetweenRange = (range: BreakpointRange, breakpoint: IAddBreakpoint): boolean => {
  if (breakpoint.minWidth === undefined || breakpoint.maxWidth === undefined) {
    return false
  }
  return (
    (range.minWidth <= breakpoint.minWidth && breakpoint.minWidth <= range.maxWidth) ||
    (range.minWidth <= breakpoint.maxWidth && breakpoint.maxWidth <= range.maxWidth)
  )
}

export const useEditBreakpoints = () => {
  const initBreakpoints = () => {
    breakpoints.value = sortedBreakpoints.value.map((breakpoint) =>
      structuredClone(toRaw(breakpoint)),
    )
  }

  const addBreakpoint = () => {
    breakpoints.value.push({
      id: undefined,
      name: undefined,
      minWidth: undefined,
      maxWidth: undefined,
    })
  }

  const updateMinWidth = (index: number, value: string) => {
    const breakpoint = breakpoints.value[index]
    const width = parseInt(value)
    if (Number.isNaN(width)) {
      breakpoint.minWidth = undefined
    } else {
      breakpoint.minWidth = width
    }
  }

  const updateMaxWidth = (index: number, value: string) => {
    const breakpoint = breakpoints.value[index]
    const width = parseInt(value)
    if (Number.isNaN(width)) {
      breakpoint.maxWidth = undefined
    } else {
      breakpoint.maxWidth = width
    }
  }

  return {
    breakpoints,
    errorKeys,
    addBreakpoint,
    initBreakpoints,
    updateMinWidth,
    updateMaxWidth,
  }
}
