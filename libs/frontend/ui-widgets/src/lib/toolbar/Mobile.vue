<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="M22 4H10a2.002 2.002 0 0 0-2 2v22a2.002 2.002 0 0 0 2 2h12a2.003 2.003 0 0 0 2-2V6a2.002 2.002 0 0 0-2-2Zm0 2v2H10V6ZM10 28V10h12v18Z"
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
