<template>
  <div class="usage-wrap">
    <div class="usage">
      <div class="bar-bg"></div>
      <div class="bar" :style="{ width: progress }"></div>
    </div>
    <Spinner v-if="loading" :size="9" color="#3a86ff" class="usage-loading" />
    <div v-else class="usage-text">
      {{ progressText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { formatBytes } from '@pubstudio/shared/util-format'
import { Spinner } from '@pubstudio/frontend/ui-widgets'

const props = withDefaults(
  defineProps<{
    loading: boolean
    // Current usage in bytes
    current: number | undefined
    // Max allowed usage
    max: number | undefined
  }>(),
  {
    current: 0,
    max: 100,
  },
)
const { current, max, loading } = toRefs(props)

const progressText = computed(() => {
  const curStr = formatBytes(current.value)
  const maxStr = formatBytes(max.value)
  return `${curStr} / ${maxStr}`
})

const progress = computed(() => {
  if (loading.value) {
    return '0%'
  }
  return `${100 * (current.value / max.value)}%`
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
.usage-loading {
  height: 20px;
  margin-top: 7px;
}
</style>
