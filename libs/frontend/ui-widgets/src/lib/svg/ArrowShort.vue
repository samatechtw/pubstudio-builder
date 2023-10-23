<template>
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- eslint-disable max-len -->
    <path
      d="M9.41083 14.4106L10.5892 15.589L16.1783 9.99981L10.5892 4.41064L9.41083 5.58898L12.9883 9.16648H5V10.8331H12.9883L9.41083 14.4106Z"
      :fill="color"
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
    color: '#451DD6',
  },
)
</script>
