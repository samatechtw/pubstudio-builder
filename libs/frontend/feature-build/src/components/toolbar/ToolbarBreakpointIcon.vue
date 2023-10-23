<template>
  <ComputedIcon class="breakpoint-icon" />
</template>

<script lang="ts" setup>
import { IBreakpoint } from '@pubstudio/shared/type-site'
import { Desktop, Mobile, TabletLarge, TabletSmall } from '@pubstudio/frontend/ui-widgets'
import { DEFAULT_BREAKPOINT_ID } from '@pubstudio/frontend/util-ids'
import { computed, h, toRefs } from 'vue'

const props = defineProps<{
  breakpoint: IBreakpoint
}>()

const { breakpoint } = toRefs(props)

const ComputedIcon = computed(() => {
  const breakpointId = breakpoint.value.id
  if (breakpointId === DEFAULT_BREAKPOINT_ID) {
    return h(Desktop)
  } else if (breakpointId === 'breakpoint-2') {
    // TODO: replace hardcoded ids with constants
    return h(TabletLarge)
  } else if (breakpointId === 'breakpoint-3') {
    return h(TabletSmall)
  } else {
    return h(Mobile)
  }
})
</script>

<style lang="postcss" scoped>
.breakpoint-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
