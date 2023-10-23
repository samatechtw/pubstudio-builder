import { arrow, offset, Placement, shift, Strategy, useFloating } from '@floating-ui/vue'
import { computed } from '@vue/reactivity'
import { ComputedRef, CSSProperties, ref, Ref } from 'vue'

export interface ITooltipStyle extends CSSProperties {
  position: Strategy
  top: string
  left: string
  width: string
}

export interface IUseTooltip {
  show: Ref<boolean>
  tooltipStyle: ComputedRef<ITooltipStyle>
  itemRef: Ref<Element | null>
  tooltipRef: Ref<HTMLElement | null>
  arrowRef: Ref<HTMLElement | null> | undefined
  arrowStyle: ComputedRef<CSSProperties> | undefined
  update: () => void
  tooltipMouseEnter: () => void
  tooltipMouseLeave: () => void
}

export interface IUseTooltipOptions {
  placement?: Placement
  arrow?: boolean
  offset?: number
  shift?: boolean
}

export const useTooltip = (options?: IUseTooltipOptions): IUseTooltip => {
  const placement = options?.placement ?? 'bottom'
  let arrowRef: Ref<HTMLElement | null> | undefined = undefined
  let arrowStyle: ComputedRef<CSSProperties> | undefined = undefined
  const middleware = []

  if (options?.offset) {
    middleware.push(offset(options?.offset))
  }
  if (options?.shift) {
    middleware.push(shift())
  }
  if (options?.arrow) {
    arrowRef = ref(null)
    middleware.push(arrow({ element: arrowRef }))
  }

  const itemRef = ref(null)
  const tooltipRef = ref(null)
  const show = ref(false)
  const tooltip = useFloating(itemRef, tooltipRef, {
    placement,
    middleware,
  })
  const side = placement.split('-')[0]
  const { x, y, strategy, update, middlewareData } = tooltip

  if (options?.arrow) {
    const arrowX = computed(() => middlewareData.value.arrow?.x ?? null)
    const arrowY = computed(() => middlewareData.value.arrow?.y ?? null)

    arrowStyle = computed(() => {
      const staticSide =
        {
          top: 'bottom',
          right: 'left',
          bottom: 'top',
          left: 'right',
        }[side] ?? placement
      const offset = options?.offset ?? 2
      return {
        left: arrowX.value != null ? `${arrowX.value}px` : '',
        top: arrowY.value != null ? `${arrowY.value}px` : '',
        [staticSide]: `-${offset - 2}px`,
      }
    })
  }

  const tooltipStyle = computed(() => ({
    position: strategy.value,
    top: `${y.value ?? 0}px`,
    left: `${x.value ?? 0}px`,
    width: 'max-content',
    'z-index': 1001,
  }))

  const tooltipMouseEnter = () => {
    show.value = true
  }

  const tooltipMouseLeave = () => {
    show.value = false
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
