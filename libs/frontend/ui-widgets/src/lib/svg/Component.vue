<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M28 2h-5v2h5v24h-5v2h5a2.006 2.006 0 0 0 2-2V4a2.006 2.006 0 0 0-2-2zM14 17H8a.945.945 0 0 0-1 1v6a.945.945 0 0 0 1 1h6a.945.945 0 0 0 1-1v-6a.945.945 0 0 0-1-1zm-1 6H9v-4h4z"
    />
    <path
      :fill="color"
      d="M25 24v-6a.945.945 0 0 0-1-1h-6a.945.945 0 0 0-1 1v6a.945.945 0 0 0 1 1h6a1.002 1.002 0 0 0 1-1zm-2-1h-4v-4h4zM14 7H8a.945.945 0 0 0-1 1v6a.945.945 0 0 0 1 1h6a.945.945 0 0 0 1-1V8a.945.945 0 0 0-1-1zm-1 6H9V9h4zm5 2h6a.945.945 0 0 0 1-1V8a.945.945 0 0 0-1-1h-6a.945.945 0 0 0-1 1v6a1.002 1.002 0 0 0 1 1zm1-6h4v4h-4z"
    />
    <path
      :fill="color"
      d="M4 4h5V2H4a2.006 2.006 0 0 0-2 2v24a2.006 2.006 0 0 0 2 2h5v-2H4Z"
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
