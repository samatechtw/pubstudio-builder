<template>
  <ToolbarItem
    :active="activeBreakpoint.id === breakpoint.id"
    :customTooltip="true"
    @mousedown.prevent
    @click="click"
  >
    <template #default>
      <ToolbarBreakpointIcon :breakpoint="breakpoint" />
    </template>
    <template #tooltip>
      <div class="breakpoint-name">
        {{ breakpoint.name }}
      </div>
      <div class="breakpoint-range">
        {{ breakpointRange }}
      </div>
      <div class="breakpoint-hint">
        {{ breakpointHint }}
      </div>
    </template>
  </ToolbarItem>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { IBreakpoint } from '@pubstudio/shared/type-site'
import { useBreakpoint } from '@pubstudio/frontend/feature-breakpoint'
import { useBuild } from '@pubstudio/frontend/feature-build'
import ToolbarBreakpointIcon from './ToolbarBreakpointIcon.vue'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'

const { t } = useI18n()

const props = defineProps<{
  breakpoint: IBreakpoint
}>()

const { breakpoint } = toRefs(props)

const { editor } = useBuild()
const { activeBreakpoint, applyBreakpoint } = useBreakpoint(editor)

const click = () => {
  applyBreakpoint(breakpoint.value)
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
    position: relative;
    &-active {
      background-color: $color-toolbar-button-active;
    }
  }
}

.toolbar-item :deep(.tooltip) {
  @mixin tooltip;
  max-width: 280px;
}
.breakpoint-name {
  @mixin title 18px;
}

.breakpoint-hint {
  color: $grey-500;
  margin-top: 8px;
}
</style>
