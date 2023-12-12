import {
  arrow,
  autoUpdate,
  computePosition,
  flip,
  Middleware,
  offset,
  Placement,
  shift,
  Strategy,
  useFloating,
} from '@floating-ui/vue'
import { CSSProperties, nextTick, ref, Ref } from 'vue'

export interface ITooltipStyle extends CSSProperties {
  position: Strategy
  top: string
  left: string
  width: string
}

export interface IUseTooltip {
  show: Ref<boolean>
  tooltipStyle: Ref<ITooltipStyle>
  itemRef: Ref<Element | null>
  tooltipRef: Ref<HTMLElement | null>
  arrowRef: Ref<HTMLElement | null> | undefined
  arrowStyle: Ref<CSSProperties | undefined>
  update: () => void
  tooltipMouseEnter: () => void
  tooltipMouseLeave: () => void
}

export interface IUseTooltipOptions {
  placement?: Placement
  arrow?: boolean
  offset?: number
  shift?: boolean
  flip?: boolean
}

export const useTooltip = (options?: IUseTooltipOptions): IUseTooltip => {
  const placement = options?.placement ?? 'bottom'
  let arrowRef: Ref<HTMLElement | null> | undefined = undefined
  const arrowStyle = ref<CSSProperties | undefined>()
  let autoUpdateCleanup: (() => void) | undefined = undefined
  const middleware: Middleware[] = []

  if (options?.offset) {
    middleware.push(offset(options?.offset))
  }
  if (options?.shift) {
    middleware.push(shift())
  }
  if (options?.flip) {
    middleware.push(flip())
  }
  if (options?.arrow) {
    arrowRef = ref(null)
    middleware.push(arrow({ element: arrowRef }))
  }

  const itemRef = ref<Element | null>(null)
  const tooltipRef = ref(null)
  const show = ref(false)
  const tooltip = useFloating(itemRef, tooltipRef, {
    placement,
    middleware,
  })
  const { x, y, strategy, update } = tooltip

  if (options?.arrow) {
    arrowStyle.value = {
      left: '0px',
      right: '0px',
    }
  }

  interface IArrow {
    x?: number
    y?: number
  }

  const computeArrow = (arrow: IArrow, placement: string) => {
    if (arrowStyle.value) {
      const side = placement.split('-')[0]

      const x = arrow.x ?? null
      const y = arrow.y ?? null
      const staticSide =
        {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[side] ?? placement
      const offset = options?.offset ?? 10
      arrowStyle.value = {
        left: x === null ? '' : `${x}px`,
        top: y === null ? '' : `${y}px`,
        [staticSide]: `-${offset - 2}px`,
      }
    }
  }

  const tooltipStyle = ref<ITooltipStyle>({
    position: strategy.value,
    top: `${y.value ?? 0}px`,
    left: `${x.value ?? 0}px`,
    width: 'max-content',
    'z-index': 1001,
  })

  const updatePosition = async () => {
    if (itemRef.value && tooltipRef.value) {
      const {
        x,
        y,
        middlewareData,
        placement: updatedPlacement,
      } = await computePosition(itemRef.value, tooltipRef.value, {
        placement,
        middleware,
      })
      tooltipStyle.value.position = strategy.value
      tooltipStyle.value.top = `${y ?? 0}px`
      tooltipStyle.value.left = `${x ?? 0}px`
      if (middlewareData.arrow) {
        computeArrow(middlewareData.arrow, updatedPlacement)
      }
    }
  }

  const tooltipMouseEnter = async () => {
    show.value = true
    await nextTick()
    if (itemRef.value && tooltipRef.value) {
      autoUpdateCleanup = autoUpdate(itemRef.value, tooltipRef.value, updatePosition, {
        ancestorScroll: false,
        ancestorResize: false,
        elementResize: false,
      })
    }
  }

  const tooltipMouseLeave = () => {
    show.value = false
    autoUpdateCleanup?.()
  }

  return {
    show,
    tooltipStyle,
    itemRef,
    tooltipRef,
    arrowRef,
    arrowStyle,
    update,
    tooltipMouseEnter,
    tooltipMouseLeave,
  }
}
