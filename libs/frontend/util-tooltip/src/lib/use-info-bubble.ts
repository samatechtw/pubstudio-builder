import { Placement } from '@floating-ui/vue'
import { useClickaway } from '@pubstudio/frontend/util-clickaway'
import { CSSProperties, Ref } from 'vue'
import { ITooltipStyle, useTooltip } from './use-tooltip'

export interface IUseInfoBubbleOptions {
  hideDelay: Ref<number>
  showArrow: boolean
  placement?: Placement | undefined
}

export interface IUseInfoBubble {
  show: Ref<boolean>
  tooltipStyle: Ref<ITooltipStyle>
  itemRef: Ref<Element | null>
  tooltipRef: Ref<HTMLElement | null>
  arrowStyle: Ref<CSSProperties | undefined>
  cancelBubbleDelay: () => void
  clickInfo: () => void
  hideBubble: () => void
}

let prevClose: (() => void) | undefined = undefined

export const useInfoBubble = (options: IUseInfoBubbleOptions) => {
  const { hideDelay, showArrow, placement } = options

  const {
    itemRef,
    arrowStyle,
    tooltipRef,
    tooltipStyle,
    show,
    tooltipMouseEnter,
    tooltipMouseLeave,
  } = useTooltip({
    placement: placement,
    arrow: showArrow,
    offset: 8,
    shift: true,
  })
  let hoverTimer: ReturnType<typeof setTimeout> | undefined

  useClickaway('.info-bubble-wrap', () => setShow(false))

  const clickInfo = () => {
    setShow(!show.value)
    cancelBubbleDelay()
  }

  const setShow = (newShow: boolean) => {
    if (newShow === show.value) {
      return
    }
    if (newShow) {
      if (prevClose) {
        prevClose()
      }
      tooltipMouseEnter()
      prevClose = tooltipMouseLeave
    } else {
      tooltipMouseLeave()
    }
  }
  const cancelBubbleDelay = () => {
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      hoverTimer = undefined
    }
  }

  const hideBubble = () => {
    if (hideDelay.value) {
      cancelBubbleDelay()
      hoverTimer = setTimeout(() => setShow(false), hideDelay.value)
    } else {
      setShow(false)
    }
  }

  return {
    itemRef,
    arrowStyle,
    tooltipRef,
    tooltipStyle,
    show,
    cancelBubbleDelay,
    clickInfo,
    hideBubble,
  }
}
