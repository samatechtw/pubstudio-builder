<template>
  <div class="menu-row">
    <div class="label">
      {{ label }}
    </div>
    <STInput
      :modelValue="modelValue"
      class="item"
      :placeholder="placeholder"
      @update:modelValue="emit('update:modelValue', $event)"
      @keyup.esc="($event.target as HTMLInputElement)?.blur()"
    />
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'
import { STInput } from '@samatech/vue-components'

const props = withDefaults(
  defineProps<{
    label: string
    modelValue?: string | undefined
    placeholder?: string
  }>(),
  {
    modelValue: undefined,
    placeholder: undefined,
  },
)
const { modelValue } = toRefs(props)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | undefined): void
}>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.menu-row {
  .label {
    @mixin title-bold 13px;
  }
  .item {
    @mixin truncate;
    margin-left: auto;
  }
  :deep(.st-input) {
    padding: 0 10px;
    height: 32px;
  }
}
</style>
