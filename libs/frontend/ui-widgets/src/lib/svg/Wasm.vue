<template>
  <!-- eslint-disable max-len -->
  <svg height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg">
    <path
      d="m19.153 2.35v.15a3.2 3.2 0 1 1 -6.4 0v-.15h-10.753v27.919h27.919v-27.919z"
      :fill="color"
    />
    <path
      d="m8.485 17.4h1.85l1.265 6.723h.023l1.517-6.723h1.731l1.371 6.81h.027l1.44-6.81h1.815l-2.358 9.885h-1.837l-1.36-6.728h-.036l-1.456 6.728h-1.87zm13.124 0h2.917l2.9 9.885h-1.911l-.63-2.2h-3.323l-.486 2.2h-1.859zm1.11 2.437-.807 3.627h2.512l-.924-3.632z"
      fill="#fff"
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
    color: '#654ff0',
  },
)
</script>
