<template>
  <div class="text" @click="emit('click')">
    <Caret :class="{ active }" class="caret" />
    {{ text }}
  </div>
</template>

<script lang="ts" setup>
import { Caret } from '@pubstudio/frontend/ui-widgets'

defineProps<{
  text: string
  active?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

$arrow-size: 10px;

.text {
  @mixin flex-row;
  @mixin title-medium 13px;
  width: 100%;
  color: $color-title;
  justify-content: flex-start;
  align-items: center;
  transition: color 0.2s;
  cursor: pointer;
  padding: 6px 6px 4px 6px;
  .caret {
    @mixin size 22px;
    visibility: hidden;
  }
  .active {
    visibility: visible;
  }
  &:hover {
    color: $color-toolbar-button-active;
    :deep(path) {
      fill: $color-toolbar-button-active;
    }
  }
}
</style>
