<template>
  <div class="checkbox" :class="{ disabled }" @click="handleCheck($event, !item.checked)">
    <input
      type="checkbox"
      :value="item.label"
      :checked="item.checked"
      :modelValue="item.checked"
      :disabled="disabled"
    />
    <span class="checkmark" :class="internalCheckedClass" />
    <span v-if="item.label" class="checkbox-text" v-html="item.label" />
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs, PropType } from 'vue'

export interface CheckboxData {
  label?: string
  checked: boolean | undefined
}

const emit = defineEmits<{
  (e: 'checked', value: boolean): void
}>()
const props = defineProps({
  // Format: `reactive({ label: <string>, checked: <boolean> })`)
  item: {
    type: Object as PropType<CheckboxData>,
    required: true,
  },
  // Optional override of checkbox class
  checkedClass: {
    type: String,
    default: null,
    validator: (value: string) => ['partial', 'checked', '', null].indexOf(value) !== -1,
  },
  disabled: {
    type: Boolean,
  },
})
const { checkedClass, item, disabled } = toRefs(props)
const internalCheckedClass = computed(() => {
  if (checkedClass.value === null) {
    return item.value.checked ? 'checked' : ''
  }
  return checkedClass.value
})

const handleCheck = (event: MouseEvent, checked: boolean) => {
  if (!disabled.value && event.target) {
    const el = event.target as Element
    if (el.nodeName !== 'A') {
      item.value.checked = checked
      emit('checked', checked)
    }
  }
}
</script>

<style lang="postcss" scoped>
.checkbox {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  margin: 8px 16px 16px 0;

  &.disabled {
    cursor: not-allowed;
  }

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkbox-text {
    font-size: 15px;
    padding-top: 2px;
  }

  .checkmark {
    height: 16px;
    width: 16px;
    background-color: #fff;
    border-radius: 2px;
    border: 1px solid grey;
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    margin-right: 8px;

    &.partial {
      background-color: darkblue;
      &::after {
        content: '';
        display: block;
        width: 6px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
      }
    }
    &.checked {
      background-color: darkblue;
      border: 1px solid transparent;

      &::after {
        content: '';
        display: block;
        width: 3px;
        height: 6px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: translate(0, -1px) rotate(45deg);
      }
    }
  }
}
</style>
