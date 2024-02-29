<template>
  <div class="ps-toggle-button-wrap">
    <button
      v-for="(item, index) in text"
      :key="index"
      type="button"
      class="ps-toggle-button"
      :class="{ 'ps-toggle-button--on': selected === index }"
      @click="emit('click', index)"
    >
      <span class="ps-toggle-button-text">
        {{ item }}
      </span>
    </button>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  selected?: number
  text: string[]
}>()

const emit = defineEmits<{
  (e: 'click', index: number): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-toggle-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 12px;
  min-width: 72px;
  height: 40px;
  cursor: pointer;
  color: $grey-900;
  background-color: white;
  border: 1px solid $black-opaque-15;
  border-radius: 16px;
  transition: all 0.2s;
  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
  &:active {
    background-color: $grey-300;
  }
}

.ps-toggle-button-text {
  @mixin title-thin 15px;
  &:not(:only-child) {
    margin-left: 8px;
  }
}
.ps-toggle-button--on {
  color: white;
  border-color: transparent;
  background-color: $purple-button;
  &:active {
    opacity: 0.85;
  }
}
</style>
