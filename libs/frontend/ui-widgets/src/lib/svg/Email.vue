<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <!-- eslint-disable max-len -->
    <path
      :fill="color"
      d="M28 6H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Zm-2.2 2L16 14.78L6.2 8ZM4 24V8.91l11.43 7.91a1 1 0 0 0 1.14 0L28 8.91V24Z"
    />
    <!-- eslint-enable max-len -->
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: string
  }>(),
  {
    color: '#d7d7db',
  },
)
</script>
