<template>
  <div class="build-icon-text" @click="emit('click')">
    <slot />
    <span class="text">
      {{ text }}
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  text: string
}>()
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';
.build-icon-text {
  @mixin flex-col;
  align-items: center;
  color: $color-title;
  cursor: pointer;
  :deep(svg) {
    @mixin size 28px;
    fill: $color-title;
  }
  .text {
    @mixin title-medium 12px;
    margin-top: 4px;
    text-align: center;
  }
  &:hover {
    color: $color-toolbar-button-active;
    :deep(svg) {
      path,
      circle {
        fill: $color-toolbar-button-active;
        stroke: $color-toolbar-button-active;
      }
    }
  }
}
</style>
