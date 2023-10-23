<template>
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- eslint-disable -->
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15.4144 2.00015L14.0002 0.585938L8.00015 6.58594L2.00015 0.585938L0.585938 2.00015L6.58594 8.00015L0.585938 14.0002L2.00015 15.4144L8.00015 9.41436L14.0002 15.4144L15.4144 14.0002L9.41436 8.00015L15.4144 2.00015Z"
      :fill="color"
    />
    <!-- eslint-disable -->
  </svg>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: string
  }>(),
  {
    color: '#23262f',
  },
)
</script>
