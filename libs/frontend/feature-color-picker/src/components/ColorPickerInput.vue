<template>
  <input class="color-picker-input" :value="modelValue" />
</template>

<script lang="ts" setup>
defineProps<{
  modelValue: string | number
}>()

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.color-picker-input {
  width: 100%;
  height: 26px;
  padding: 0 12px;
  margin-left: 8px;
  border: none;
  color: #fff;
  background: #2e333a;
}
</style>
