<template>
  <button class="color-picker-button" @click="emit('click')">
    <slot />
  </button>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.color-picker-button {
  @mixin flex-center;
  @mixin title-medium 12px;
  color: $grey-100;
  height: 26px;
  padding: 0 8px;
  border: none;
  cursor: pointer;
  background: #335;
  flex-shrink: 0;
  box-shadow:
    inset 1px 1px 1px rgba(255, 255, 255, 0.4),
    inset -1px -1px 1px rgba(0, 0, 0, 0.4);
  &:active {
    box-shadow:
      inset 1px 1px 1px rgba(0, 0, 0, 0.8),
      inset -1px -1px 1px rgba(255, 255, 255, 0.4);
  }
}
</style>
