<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      d="M16 28H4a1.89 1.89 0 0 1-2-2V14a1.89 1.89 0 0 1 2-2h12a1.89 1.89 0 0 1 2 2v12a1.89 1.89 0 0 1-2 2zM4 14v12h12V14z"
      :fill="color"
    />
    <path d="M22 19h-2v-9H10V8h10a1.89 1.89 0 0 1 2 2z" :fill="color" />
    <path d="M26 14h-2V6h-8V4h8a1.89 1.89 0 0 1 2 2z" :fill="color" />
    <path d="M24 17v2h2.8L22 24.4V22h-2v6h6v-2h-2.8l4.8-5.4V23h2v-6h-6z" :fill="color" />
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
