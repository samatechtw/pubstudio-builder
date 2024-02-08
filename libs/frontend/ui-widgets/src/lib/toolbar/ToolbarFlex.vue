<template>
  <div class="flex-input-wrap">
    <div class="flex-label">
      {{ label }}
    </div>
    <div
      :class="`flex-input-row ${inputWrapClass ?? ''}`"
      @click="emit('inputClick', $event)"
    >
      <input
        ref="inputRef"
        :value="modelValue"
        type="text"
        :tabindex="rightMenuTabIndex"
        :name="`input${uid}`"
        class="flex-input"
        :class="{ invalid, auto: isAuto }"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement)?.value)"
        @keyup.esc="inputRef?.blur()"
      />
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { uidSingleton } from '@pubstudio/frontend/util-doc'
import { rightMenuTabIndex } from '@pubstudio/frontend/util-runtime'

const uid = uidSingleton.next()
const inputRef = ref()

const props = defineProps<{
  modelValue: string
  label: string
  invalid?: boolean
  isAuto?: boolean
  inputWrapClass?: string
}>()
const { modelValue } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focusout', value: string | number | undefined): void
  (e: 'inputClick', event: MouseEvent): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.flex-input-wrap {
  @mixin flex-col;
  align-items: center;
  margin-left: 4px;
  cursor: pointer;
}
.flex-label {
  @mixin title-bold 11px;
  font-weight: 600;
  cursor: initial;
  user-select: none;
}
.flex-input-row {
  display: flex;
}
.flex-input {
  @mixin input;
  @mixin text 12px;
  width: 36px;
  text-align: center;
  padding: 1px 2px 2px;
  height: 20px;
  border-radius: 4px;
  &.auto {
    cursor: pointer;
    pointer-events: none;
  }
  &.invalid {
    outline: none;
    border-radius: 2px;
    border: 1px solid $color-error;
  }
}
</style>
