<template>
  <div
    ref="itemRef"
    class="info-bubble-wrap"
    @mouseleave="hideBubble"
    @mouseenter="cancelBubbleDelay"
    @click="clickInfo"
  >
    <slot v-if="customIcon" />
    <svg
      v-else
      width="48"
      height="48"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        :stroke="color"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10" data-name="--Circle" />
        <path d="M12 12v4M12 8h0" />
      </g>
    </svg>
    <teleport to="body">
      <div
        v-if="show"
        ref="tooltipRef"
        class="message"
        :class="{ [messageClass ?? '']: !!messageClass }"
        :style="tooltipStyle"
        @mouseleave="hideBubble"
        @mouseenter="cancelBubbleDelay"
      >
        <div v-if="useHtml" class="message-html" v-html="message" />
        <template v-else-if="message">
          {{ message }}
        </template>
        <slot v-else name="message" />
        <div v-if="showArrow" ref="arrowRef" :style="arrowStyle" class="arrow" />
      </div>
    </teleport>
  </div>
</template>

<script lang="ts" setup>
import { Placement } from '@floating-ui/vue'
import { useTooltip } from '@pubstudio/frontend/util-tooltip'
import { ref, toRefs } from 'vue'

const props = withDefaults(
  defineProps<{
    message?: string
    messageClass?: string
    hideDelay?: number
    color?: string
    customIcon?: boolean
    showArrow?: boolean
    placement?: Placement
    useHtml?: boolean
  }>(),
  {
    message: undefined,
    messageClass: undefined,
    color: '#000',
    placement: 'left',
    hideDelay: 1000,
    useHtml: false,
  },
)
const { hideDelay, showArrow, placement } = toRefs(props)

const { itemRef, arrowStyle, tooltipRef, tooltipStyle } = useTooltip({
  placement: placement.value,
  arrow: showArrow.value,
  offset: 8,
  shift: true,
})
const show = ref(false)
let hoverTimer: ReturnType<typeof setTimeout> | undefined

const clickInfo = () => {
  show.value = !show.value
  cancelBubbleDelay()
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
    hoverTimer = setTimeout(() => (show.value = false), hideDelay.value)
  } else {
    show.value = false
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.info-bubble-wrap {
  @mixin size 20px;
  cursor: pointer;
  &:hover {
    :deep(svg g) {
      fill: $color-light1;
    }
  }
}
.message {
  @mixin tooltip;
  position: absolute;
  max-width: 200px;
  z-index: 1000;
}

:deep(svg) {
  width: 100%;
  height: 100%;
  user-select: none;
}

.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  bottom: -6px;
  left: calc(50% - 6px);
}
</style>
