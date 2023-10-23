<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
    <path :fill="color" d="M19 24v2h-6v-2z" />
    <path
      :fill="color"
      d="M25 30H7a2.002 2.002 0 0 1-2-2V4a2.002 2.002 0 0 1 2-2h18a2.002 2.002 0 0 1 2 2v24a2.003 2.003 0 0 1-2 2ZM7 4v24h18V4Z"
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
