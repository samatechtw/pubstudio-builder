<template>
  <span
    class="icon-button-wrap"
    :class="{ 'icon-button-wrap--disabled': disabled }"
    @click="!disabled && emit('click')"
  >
    <slot />
  </span>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    buttonSize?: number
    iconSize?: number
    disabled?: boolean
  }>(),
  {
    buttonSize: 16,
    iconSize: 8,
  },
)

const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.icon-button-wrap {
  @mixin flex-center;
  width: v-bind(buttonSize + 'px');
  height: v-bind(buttonSize + 'px');
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;

  :slotted(svg) {
    width: v-bind(iconSize + 'px');
    height: v-bind(iconSize + 'px');
  }

  &:not(.icon-button-wrap--disabled) {
    &:hover {
      background-color: $color-light1;
    }
    &:active {
      background-color: $color-light2;
    }
  }

  &.icon-button-wrap--disabled {
    cursor: default;
    :slotted(svg) {
      fill: $color-disabled;
    }
  }
}
</style>
