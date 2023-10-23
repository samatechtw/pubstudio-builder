<template>
  <div
    ref="itemRef"
    class="ps-dropdown-item breakpoint-option"
    :class="{ 'breakpoint-option-active': breakpoint.id === activeBreakpoint.id }"
    @mouseenter="tooltipMouseEnter"
    @mouseleave="tooltipMouseLeave"
    @click="click"
  >
    <ToolbarBreakpointIcon :breakpoint="breakpoint" />
    <div v-if="show" ref="tooltipRef" class="tooltip" :style="tooltipStyle">
      <div class="breakpoint-name">
        {{ breakpoint.name }}
      </div>
      <div class="breakpoint-range">
        {{ breakpointRange }}
      </div>
      <div class="breakpoint-hint">
        {{ breakpointHint }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { IBreakpoint } from '@pubstudio/shared/type-site'
import { useTooltipDelay } from '@pubstudio/frontend/util-tooltip'
import { useBreakpoint } from '@pubstudio/frontend/feature-breakpoint'
import ToolbarBreakpointIcon from './ToolbarBreakpointIcon.vue'
import { useBuild } from '../../lib/use-build'

const { t } = useI18n()

const props = defineProps<{
  breakpoint: IBreakpoint
}>()

const { breakpoint } = toRefs(props)

const { editor } = useBuild()
const { activeBreakpoint, applyBreakpoint } = useBreakpoint(editor)

const {
  itemRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  cancelHoverTimer,
  tooltipRef,
  tooltipStyle,
  show,
} = useTooltipDelay()

const click = () => {
  applyBreakpoint(breakpoint.value)
  cancelHoverTimer()
}

const breakpointRange = computed(() => {
  const { minWidth, maxWidth } = breakpoint.value
  if (minWidth !== undefined && maxWidth !== undefined) {
    return t('build.breakpoint.range_between', { minWidth, maxWidth })
  } else if (minWidth !== undefined) {
    return t('build.breakpoint.range_min', { minWidth })
  } else if (maxWidth !== undefined) {
    return t('build.breakpoint.range_max', { maxWidth })
  } else {
    return t('default')
  }
})

const breakpointHint = computed(() => {
  const { minWidth, maxWidth } = breakpoint.value
  if (minWidth !== undefined && maxWidth !== undefined) {
    return t('build.breakpoint.hint_between', { minWidth, maxWidth })
  } else if (minWidth !== undefined) {
    return t('build.breakpoint.hint_min', { minWidth })
  } else if (maxWidth !== undefined) {
    return t('build.breakpoint.hint_max', { maxWidth })
  } else {
    return t('build.breakpoint.hint_default')
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-dropdown {
  .breakpoint-option {
    @mixin flex-center;
    width: 40px;
    height: 40px;
    &-active {
      background-color: $color-toolbar-button-active;
    }
  }
}

.tooltip {
  @mixin tooltip;
  max-width: 280px;
  margin-top: 4px;
  padding: 12px;
}
.breakpoint-name {
  @mixin title 18px;
}

.breakpoint-hint {
  color: $grey-500;
  margin-top: 8px;
}
</style>
