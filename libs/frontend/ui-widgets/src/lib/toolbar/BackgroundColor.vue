<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <rect
      x="4"
      y="4"
      width="24"
      height="24"
      fill="transparent"
      :stroke="color"
      rx="1"
      ry="1"
      stroke-width="3"
    />
    <polygon points="5 5, 5 27, 27 5" :fill="fill" />
  </svg>
  <!-- eslint-enable max-len -->
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: string
    fill?: string
  }>(),
  {
    color: '#000',
    fill: '#000',
  },
)
</script>
