<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M22 21h2L17 4h-2L8 21h2l1.61-4h8.74zm-9.57-6l3.44-8.37h.26L19.54 15zM6 24h20v4H6z"
    />
    <rect x="6" y="24" fill="black" width="20" height="4" />
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
