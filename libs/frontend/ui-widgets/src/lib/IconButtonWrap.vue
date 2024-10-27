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
.icon-button-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
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
      background-color: var(--st-component-light1, #5d99b6);
    }
    &:active {
      background-color: var(--st-component-light2, #a69cd4);
    }
  }

  &.icon-button-wrap--disabled {
    cursor: default;
    :slotted(svg) {
      fill: var(--st-component-disabled, #a1a1aa);
    }
  }
}
</style>
