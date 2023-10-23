<template>
  <!-- eslint-disable max-len -->
  <svg
    fill="none"
    height="800"
    viewBox="0 0 24 24"
    width="800"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g :stroke="color" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="m7 13 3 3 7-7" />
      <circle cx="12" cy="12" r="9" />
    </g>
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
