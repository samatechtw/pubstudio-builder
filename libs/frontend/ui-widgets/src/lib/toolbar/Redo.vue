<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M12 10h12.185l-3.587-3.586L22 5l6 6l-6 6l-1.402-1.415L24.182 12H12a6 6 0 0 0 0 12h8v2h-8a8 8 0 0 1 0-16Z"
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
