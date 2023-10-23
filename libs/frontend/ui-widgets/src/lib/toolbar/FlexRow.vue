<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M12 30H4a2.002 2.002 0 0 1-2-2V4a2.002 2.002 0 0 1 2-2h8a2.002 2.002 0 0 1 2 2v24a2.002 2.002 0 0 1-2 2zM4 4v24h8V4zm24 26h-8a2.002 2.002 0 0 1-2-2V4a2.002 2.002 0 0 1 2-2h8a2.002 2.002 0 0 1 2 2v24a2.002 2.002 0 0 1-2 2zM20 4v24h8V4z"
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
