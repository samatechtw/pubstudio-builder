<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path :fill="color" d="M16 2v2h10v15h2V4a2.002 2.002 0 0 0-2-2Z" />
    <path :fill="color" d="M11 7v2h10v15h2V9a2.002 2.002 0 0 0-2-2Z" />
    <path
      :fill="color"
      d="M6 12h10a2.002 2.002 0 0 1 2 2v14a2.002 2.002 0 0 1-2 2H6a2.002 2.002 0 0 1-2-2V14a2.002 2.002 0 0 1 2-2m10 2l-10-.001V28h10Z"
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
