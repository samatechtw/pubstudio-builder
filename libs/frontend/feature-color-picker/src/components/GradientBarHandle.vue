<template>
  <div
    class="gradient-bar-handle"
    :class="{ selected: selected }"
    @mousedown="emit('select')"
  >
    <div class="handle" @mousedown="onMouseDown">
      <div class="color" />
    </div>
    <div class="stop-value" @blur="emit('blur:stop')">
      {{ gradientColor.stop }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue'
import { IGradientColor } from '@pubstudio/frontend/util-gradient'
import { useGradientBarHandle } from '../lib/use-gradient-bar-handle'

const props = defineProps<{
  gradientColor: IGradientColor
  left: number
  selected: boolean
  gradientBarWidth: number
}>()

const { gradientColor, selected, gradientBarWidth } = toRefs(props)

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'update:stop', stop: number): void
  (e: 'blur:stop'): void
  (e: 'release'): void
}>()

const { onMouseDown } = useGradientBarHandle({
  gradientBarWidth,
  gradientColor,
  updateStop: (stop) => emit('update:stop', stop),
  onRelease: () => emit('release'),
})

const zIndex = computed(() => (selected.value ? 1 : 0))
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.gradient-bar-handle {
  @mixin flex-col;
  position: absolute;
  width: 14px;
  top: -10px;
  left: v-bind(left - 4 + 'px');
  align-items: center;
  opacity: 0.45;
  z-index: v-bind(zIndex);
  &.selected,
  &:hover {
    opacity: 1;
  }
}

.handle {
  width: 14px;
  height: 42px;
  padding: 2px;
  cursor: move;
  border: 2px solid #000000;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  .color {
    height: 100%;
    border-radius: 8px;
    background-color: v-bind(gradientColor.rgba);
  }
}
.stop-value {
  font-size: 13px;
  width: 36px;
  margin: 4px 0 0 0;
  padding: 6px 0;
  border-radius: 4px;
  text-align: center;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  background: #2e333a;
}
</style>
