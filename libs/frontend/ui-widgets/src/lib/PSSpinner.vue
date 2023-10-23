<template>
  <div class="ps-spinner">
    <div class="bar" />
    <div class="bar" />
    <div class="bar" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'

const props = withDefaults(
  defineProps<{
    scale?: number
    color?: string
  }>(),
  {
    scale: 1,
    color: '#ffffff',
  },
)

const { scale } = toRefs(props)

const barSize = computed(() => {
  const height = 15 * scale.value
  const minHeight = Math.round(height * 0.66)
  const width = Math.round(height / 3)

  return {
    height: `${height}px`,
    minHeight: `${minHeight}px`,
    width: `${width}px`,
  }
})
</script>

<style lang="postcss" scoped>
.ps-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  .bar {
    width: v-bind(barSize.width);
    height: v-bind(barSize.height);
    background-color: v-bind(color);
    margin-bottom: 3px;
    &:first-child {
      animation-delay: 0.3s;
    }
    &:nth-child(2) {
      animation-delay: 0.5s;
    }
    &:not(:last-child) {
      margin-right: 7px;
    }
    animation-name: bounce;
    animation-timing-function: ease;
    animation-duration: 0.7s;
    animation-iteration-count: infinite;
  }
}

@keyframes bounce {
  0% {
    height: v-bind(barSize.height);
  }
  40% {
    height: v-bind(barSize.minHeight);
  }
  60% {
    height: v-bind(barSize.minHeight);
  }
  100% {
    height: v-bind(barSize.height);
  }
}
</style>
