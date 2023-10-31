<template>
  <div
    ref="itemRef"
    class="build-icon"
    @click="emit('click')"
    @mouseenter="tooltipMouseEnter"
    @mouseleave="tooltipMouseLeave"
  >
    <slot />
    <div v-if="text && show" ref="tooltipRef" class="tooltip" :style="tooltipStyle">
      <div ref="arrowRef" :style="arrowStyle" class="arrow" />
      <div class="tooltip-text">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useTooltip } from '@pubstudio/frontend/util-tooltip'

defineProps<{
  text: string
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const {
  arrowRef,
  arrowStyle,
  itemRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  tooltipRef,
  tooltipStyle,
  show,
} = useTooltip({ arrow: true, placement: 'right' })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 8px;

.build-icon {
  @mixin flex-col;
  align-items: center;
  position: relative;
  color: $color-title;
  transition: color 0.2s;
  cursor: pointer;
  :deep(svg) {
    @mixin size 28px;
    fill: $color-title;
  }
  .text {
    @mixin title-medium 12px;
    margin-top: 4px;
    text-align: center;
  }
  &:hover :deep(svg) {
    path,
    circle {
      fill: $color-toolbar-button-active;
      stroke: $color-toolbar-button-active;
    }
  }
}
.tooltip {
  @mixin tooltip;
  padding: 6px 10px;
  margin-left: 12px;
}
.tooltip-text {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}
.arrow {
  position: absolute;
  z-index: 1;
  background-color: white;
  border-width: 0 $arrow-size $arrow-size 0;
  display: inline-block;
  padding: calc($arrow-size);
  transform: rotate(135deg) translateX(calc(-$arrow-size / 2))
    translateY(calc(-$arrow-size / 2));
}
</style>
