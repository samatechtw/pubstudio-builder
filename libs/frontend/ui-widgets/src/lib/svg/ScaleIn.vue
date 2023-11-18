<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="m28.6 30l1.4-1.4l-7.6-7.6H29v-2H19v10h2v-6.6zM2 28.6L3.4 30l7.6-7.6V29h2V19H3v2h6.6zM17 2h-2v10.2l-4.6-4.6L9 9l7 7l7-7l-1.4-1.4l-4.6 4.6z"
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
