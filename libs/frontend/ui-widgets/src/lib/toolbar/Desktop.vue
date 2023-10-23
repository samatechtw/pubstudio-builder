<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M26 24.005H6a2.002 2.002 0 0 1-2-2v-14a2.002 2.002 0 0 1 2-2h20a2.002 2.002 0 0 1 2 2v14a2.003 2.003 0 0 1-2 2Zm-20-16v14h20v-14Zm-4 18h28v2H2z"
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
