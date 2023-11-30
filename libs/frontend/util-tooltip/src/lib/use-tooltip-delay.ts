import { Placement } from '@floating-ui/vue'
import { onUnmounted, ref } from 'vue'
import { IUseTooltip, IUseTooltipOptions, useTooltip } from './use-tooltip'

export interface IUseTooltipDelay extends IUseTooltip {
  cancelHoverTimer: () => void
}

export interface IUseTooltipDelayOptions extends IUseTooltipOptions {
  hoverDelay?: number
  globalShowDuration?: number
  placement?: Placement
  offset?: number
}

const globalShow = ref(false)
let globalShowTimer: ReturnType<typeof setTimeout> | undefined

export const useTooltipDelay = (options?: IUseTooltipDelayOptions): IUseTooltipDelay => {
  const hoverDelay = options?.hoverDelay ?? 600
  const globalShowDuration = options?.globalShowDuration ?? 1000
  const tooltip = useTooltip({
    shift: true,
    placement: options?.placement,
    offset: options?.offset,
    arrow: options?.arrow,
  })
  let mouseover = false
  let hoverTimer: ReturnType<typeof setTimeout> | undefined

  const tooltipMouseEnter = () => {
    mouseover = true
    cancelGlobalShowTimer()
    // If the user hovers over another tooltip within the delay time, immediately show
    if (globalShow.value) {
      tooltip.tooltipMouseEnter()
    } else {
      hoverTimer = setTimeout(() => {
        if (mouseover) {
          tooltip.update()
          globalShow.value = true
          tooltip.tooltipMouseEnter()
        }
      }, hoverDelay)
    }
  }

  const cancelHoverTimer = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      hoverTimer = undefined
    }
  }

  const cancelGlobalShowTimer = () => {
    if (globalShowTimer) {
      clearTimeout(globalShowTimer)
      globalShowTimer = undefined
    }
  }

  const tooltipMouseLeave = () => {
    cancelHoverTimer()
    if (globalShowDuration === 0) {
      globalShow.value = false
    } else if (!globalShowTimer) {
      globalShowTimer = setTimeout(() => {
        globalShow.value = false
      }, globalShowDuration)
    }
    mouseover = false
    tooltip.tooltipMouseLeave()
  }

  onUnmounted(() => {
    cancelHoverTimer()
    cancelGlobalShowTimer()
  })

  return {
    ...tooltip,
    cancelHoverTimer,
    tooltipMouseEnter,
    tooltipMouseLeave,
  }
}
