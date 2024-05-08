<template>
  <button
    :class="['p-button', size, disabled && 'disabled', secondary && 'secondary']"
    :disabled="disabled"
    @click="click"
  >
    <div v-if="animate" class="p-button-animate">
      <Spinner class="ps-button-spinner" />
    </div>
    <div v-else class="button-text">
      <slot name="leading-icon" />
      <span>
        {{ text }}
      </span>
      <slot />
    </div>
    <div v-if="animate" class="hidden-text">
      {{ text }}
    </div>
  </button>
</template>

<script lang="ts">
export type ButtonSize = 'small' | 'medium' | 'large' | 'full'
</script>

<script lang="ts" setup>
import { toRefs } from 'vue'
import Spinner from '../Spinner.vue'

const emit = defineEmits(['click'])

const props = withDefaults(
  defineProps<{
    text?: string
    disabled?: boolean
    animate?: boolean
    size?: ButtonSize
    secondary?: boolean
  }>(),
  {
    text: '',
    disabled: false,
    animate: false,
    size: 'large',
    secondary: false,
  },
)
const { disabled } = toRefs(props)

const click = (e: Event) => {
  if (!disabled.value) {
    emit('click', e)
  }
}
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.p-button {
  min-width: 100px;
  position: relative;
  @mixin button;
  .button-text {
    display: flex;
    align-items: center;
  }

  &.small {
    @mixin button-small;
  }
  &.medium {
    @mixin button-medium;
  }
  &.large {
    @mixin button-large;
  }
  &.full {
    @mixin button-full;
  }
  &.secondary {
    background-color: $blue-500;
    &:hover:not(:disabled) {
      background-color: rgba($blue-500, 0.8);
    }
  }
  &.disabled {
    background-color: $color-disabled;
  }
  .hidden-text {
    visibility: hidden;
  }
  .p-button-check {
    position: absolute;
    svg {
      height: 100%;
      width: 18px;
    }
  }

  .p-button-animate {
    position: absolute;
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}
</style>
