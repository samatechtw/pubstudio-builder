<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M6 12H4V4h8v2H6v6zm22 0h-2V6h-6V4h8v8zM12 28H4v-8h2v6h6v2zm16 0h-8v-2h6v-6h2v8zM15-2z"
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
