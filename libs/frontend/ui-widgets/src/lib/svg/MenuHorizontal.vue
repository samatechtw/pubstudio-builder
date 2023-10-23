<template>
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <circle cx="8" cy="16" r="2" :fill="color" />
    <circle cx="16" cy="16" r="2" :fill="color" />
    <circle cx="24" cy="16" r="2" :fill="color" />
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: string
  }>(),
  {
    color: '#2a17d6',
  },
)
</script>
