<template>
  <div class="gradient-bar">
    <div ref="bar" class="gradient-bar-inner">
      <GradientBarHandle
        v-for="(gradientColor, index) in gradientColors"
        :key="index"
        :gradientColor="gradientColor"
        :left="computeLeft(gradientColor.stop)"
        :selected="selectedIndex === index"
        :gradientBarWidth="gradientBarWidth"
        @select="emit('select', index)"
        @update:stop="updateStop(index, $event)"
        @blur:stop="emit('blur:stop')"
        @release="emit('release:handle')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { IGradientColor } from '@pubstudio/frontend/util-gradient'
import { IUpdateGradientStopParams } from '../lib/use-gradient'
import GradientBarHandle from './GradientBarHandle.vue'

defineProps<{
  selectedIndex: number
  gradientColors: IGradientColor[]
  computedGradientForBar: string
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
  (e: 'update:stop', params: IUpdateGradientStopParams): void
  (e: 'blur:stop'): void
  (e: 'release:handle'): void
}>()

const bar = ref<HTMLDivElement | undefined>()

const gradientBarWidth = computed(() => {
  const { width } = bar.value?.getBoundingClientRect() ?? {}
  return width ?? 0
})

const computeLeft = (stop: number) => {
  return Math.floor((stop * gradientBarWidth.value) / 100)
}

const updateStop = (index: number, stop: number) => {
  emit('update:stop', {
    index,
    stop,
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.gradient-bar {
  padding: 2px;
  margin: 16px 0 48px 0;
  background-color: white;
  .gradient-bar-inner {
    height: 22px;
    position: relative;
    background: v-bind(computedGradientForBar);
  }
}
</style>
