<template>
  <button
    ref="itemRef"
    role="button"
    class="toolbar-item"
    :class="{ active, alert }"
    :disabled="disabled"
    @mouseenter="tooltipMouseEnter()"
    @mouseleave="tooltipMouseLeave"
    @click="click"
  >
    <slot />
    <div
      v-if="(tooltip || customTooltip) && show"
      ref="tooltipRef"
      class="tooltip"
      :style="tooltipStyle"
    >
      <slot v-if="customTooltip" name="tooltip" />
      <template v-else>
        {{ tooltip }}
      </template>
    </div>
  </button>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import {
  IUseTooltipDelayOptions,
  useTooltipDelay,
} from '@pubstudio/frontend/util-tooltip'

const props = withDefaults(
  defineProps<{
    tooltip?: string | undefined
    active?: boolean
    disabled?: boolean
    alert?: boolean
    customTooltip?: boolean
    tooltipOptions?: IUseTooltipDelayOptions
  }>(),
  {
    tooltip: undefined,
    active: false,
    disabled: false,
    alert: false,
    tooltipOptions: undefined,
  },
)
const { tooltipOptions } = toRefs(props)
const emit = defineEmits<{
  (e: 'click', event: Event): void
}>()

const click = (e: Event) => {
  cancelHoverTimer()
  emit('click', e)
}

const {
  itemRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  cancelHoverTimer,
  tooltipRef,
  tooltipStyle,
  show,
} = useTooltipDelay(tooltipOptions.value)

defineExpose({ itemRef })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.toolbar-item {
  @mixin size $style-toolbar-height;
  @mixin flex-center;
  position: relative;
  outline: none;
  cursor: pointer;
  padding: 6px;
  border: none;
  background-color: inherit;
  transition: background-color 0.1s ease-in-out;
  &.active {
    background-color: $color-toolbar-button-active;
  }
  &:disabled {
    opacity: 40%;
  }
  &:hover {
    background-color: $color-toolbar-button-hover;
  }
  &:not(:disabled) {
    &:active,
    &.alert {
      box-shadow:
        inset 1px 1px 1px rgba(0, 0, 0, 0.1),
        inset -1px -1px 1px rgba(255, 255, 255, 0.4);
    }
  }
}
.tooltip {
  @mixin tooltip;
  margin-top: 4px;
}

:deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
