<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <defs>
      <path
        id="newTab0"
        :fill="color"
        d="M26 26H6V6h10V4H6a2.002 2.002 0 0 0-2 2v20a2.002 2.002 0 0 0 2 2h20a2.002 2.002 0 0 0 2-2V16h-2Z"
      />
    </defs>
    <use href="#newTab0" />
    <use href="#newTab0" />
    <path :fill="color" d="M26 6V2h-2v4h-4v2h4v4h2V8h4V6h-4z" />
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
