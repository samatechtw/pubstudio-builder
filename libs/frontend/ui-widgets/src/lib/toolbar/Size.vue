<template>
  <!-- eslint-disable max-len -->
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <path
      :fill="color"
      d="m21 7l-5-5l-5 5l1.409 1.419L15 5.847V13h2V5.794l2.591 2.625L21 7zm0 18l-5 5l-5-5l1.409-1.419L15 26.153V19h2v7.206l2.591-2.625L21 25zm3-14l-5 5l5 5l1.419-1.409L22.847 17H30v-2h-7.206l2.625-2.591L24 11zM8 11l5 5l-5 5l-1.419-1.409L9.153 17H2v-2h7.206l-2.625-2.591L8 11z"
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
