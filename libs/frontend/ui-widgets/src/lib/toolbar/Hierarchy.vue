<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M30 20v-8h-8v3h-5V7a2 2 0 0 0-2-2h-5V2H2v8h8V7h5v18a2 2 0 0 0 2 2h5v3h8v-8h-8v3h-5v-8h5v3ZM8 8H4V4h4Zm16 16h4v4h-4Zm0-10h4v4h-4Z"
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
