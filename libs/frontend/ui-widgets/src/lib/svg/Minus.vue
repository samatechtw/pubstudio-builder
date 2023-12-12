<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="11" :fill="color" />
    <line
      x1="6.5"
      y1="11.8"
      x2="17.5"
      y2="11.8"
      stroke="white"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: string
  }>(),
  {
    color: '#b7436a',
  },
)
</script>
