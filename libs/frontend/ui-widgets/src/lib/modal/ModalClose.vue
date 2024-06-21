<template>
  <div class="modal-close">
    <slot />
    <svg viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <line x1="1" y1="11" x2="11" y2="1" :stroke="color" stroke-width="2" />
      <line x1="1" y1="1" x2="11" y2="11" :stroke="color" stroke-width="2" />
    </svg>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    color?: string
    size?: number
  }>(),
  {
    color: 'black',
    size: 20,
  },
)
</script>

<style lang="postcss" scoped>
.modal-close {
  position: absolute;
  top: 6px;
  right: 8px;
  padding: 8px;
  cursor: pointer;
  z-index: 10;
  > svg {
    width: v-bind(size + 'px');
    height: v-bind(size + 'px');
  }
}
</style>
