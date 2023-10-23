<template>
  <!-- eslint-disable max-len -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="40"
    height="40"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      :stroke="color"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="m12 8-8 8v4h4l8-8m-4-4 2.869-2.869.001-.001c.395-.395.593-.593.821-.667a1 1 0 0 1 .618 0c.228.074.425.272.82.666l1.74 1.74c.396.396.594.594.668.822a1 1 0 0 1 0 .618c-.074.228-.272.426-.668.822h0L16 12.001m-4-4 4 4"
    />
  </svg>
  <!-- eslint-enable max-len -->
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: string
  }>(),
  {
    color: '#000',
  },
)
</script>
