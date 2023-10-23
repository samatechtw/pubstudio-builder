<template>
  <div class="usage-wrap">
    <div class="usage">
      <div class="bar-bg"></div>
      <div class="bar" :style="{ width: `${100 * (current / max)}%` }"></div>
    </div>
    <div class="usage-text">
      {{ progressText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { formatBytes } from '@pubstudio/shared/util-format'

const props = defineProps<{
  // Current usage in bytes
  current: number
  // Max allowed usage
  max: number
}>()
const { current, max } = toRefs(props)

const progressText = computed(() => {
  const curStr = formatBytes(current.value)
  const maxStr = formatBytes(max.value)
  return `${curStr} / ${maxStr}`
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.usage-wrap {
  width: 100%;
  text-align: center;
}
.usage {
  position: relative;
  height: 10px;
  width: 100%;
}
.bar-bg,
.bar {
  @mixin overlay;
  background-color: $grey-300;
  border-radius: 10px;
}
.bar {
  background-color: $green-500;
}
.usage-text {
  @mixin text 15px;
  margin-top: 8px;
}
</style>
