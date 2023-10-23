<template>
  <div class="gradient-color" :class="{ selected: selected }" @click="emit('select')">
    <div class="color-preview" :class="{ selected: selected }" />
    <GradientStopInput
      :gradientColor="gradientColor"
      @update="emit('update:stop', $event)"
      @blur="emit('blur:stop')"
    />
    <Trash
      class="delete-gradient-color-button"
      color="#ffffff"
      @click.stop="emit('delete')"
    />
  </div>
</template>

<script lang="ts" setup>
import { Trash } from '@pubstudio/frontend/ui-widgets'
import { IGradientColor } from '@pubstudio/frontend/util-gradient'
import GradientStopInput from './GradientStopInput.vue'

defineProps<{
  gradientColor: IGradientColor
  selected: boolean
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'update:stop', stop: number): void
  (e: 'blur:stop'): void
  (e: 'delete'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.gradient-color {
  @mixin flex-row;
  align-items: center;
  padding: 4px 8px;
  &.selected {
    background-color: #656c76;
  }
}

.color-preview {
  @mixin size 26px;
  flex-shrink: 0;
  cursor: pointer;
  background-color: v-bind(gradientColor.rgba);
}

.delete-gradient-color-button {
  @mixin size 18px;
  margin-left: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
</style>
