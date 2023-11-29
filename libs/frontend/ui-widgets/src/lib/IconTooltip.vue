<template>
  <div
    ref="itemRef"
    class="copy-wrap"
    @mouseenter="mouseEnter"
    @mouseleave="tooltipMouseLeave"
  >
    <slot />
    <div v-if="show" ref="tooltipRef" class="tip" :style="tooltipStyle">
      <div>
        {{ tip }}
      </div>
      <div ref="arrowRef" :style="arrowStyle" class="arrow" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { useTooltip } from '@pubstudio/frontend/util-tooltip'
import { useI18n } from 'petite-vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  tip: string
}>()
const { tip } = toRefs(props)

const emit = defineEmits<{
  (e: 'mouseenter'): void
}>()

const {
  itemRef,
  arrowStyle,
  tooltipRef,
  tooltipStyle,
  show,
  tooltipMouseEnter,
  tooltipMouseLeave,
} = useTooltip({
  placement: 'top',
  arrow: true,
  shift: true,
  offset: 8,
})

const mouseEnter = () => {
  emit('mouseenter')
  tooltipMouseEnter()
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.copy-wrap {
  position: relative;
}

.tip {
  @mixin tooltip;
  @mixin flex-center;
  padding: 6px 8px;
  position: absolute;
  z-index: 1000;
  a {
    @mixin truncate;
    max-width: calc(100% - 30px);
  }
}
.copy {
  @mixin size 18px;
  margin-left: 6px;
  flex-shrink: 0;
  cursor: pointer;
  &:hover :deep(path) {
    fill: $color-toolbar-button-active;
    stroke: $color-toolbar-button-active;
  }
}

.arrow {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid white;
  bottom: 10px;
  left: calc(50% - 6px);
}
</style>
