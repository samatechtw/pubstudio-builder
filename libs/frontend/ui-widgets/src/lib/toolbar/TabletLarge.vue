<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
    <path :fill="color" d="M24 13h2v6h-2z" />
    <path
      :fill="color"
      d="M30 7v18a2.002 2.002 0 0 1-2 2H4a2.002 2.002 0 0 1-2-2V7a2.002 2.002 0 0 1 2-2h24a2.003 2.003 0 0 1 2 2ZM4 25h24V7H4Z"
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
