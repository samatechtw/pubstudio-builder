<template>
  <div class="ps-input-wrap">
    <span v-if="prefix" class="ps-input-prefix">
      {{ prefix }}
    </span>
    <input
      ref="inputRef"
      :class="[
        'ps-input',
        inputClass,
        prefix && 'has-prefix',
        suffix && 'has-suffix',
        clearable && 'has-icon-button',
        isEmpty && 'empty',
        (isError || errorBubble) && 'error',
      ]"
      :autocomplete="autocomplete"
      :value="modelValue"
      :type="type"
      :disabled="isDisabled"
      :placeholder="placeholder"
      :name="inputName"
      :required="required"
      :list="normalizedDatalistId"
      @input="handleInput"
      @focusout="emit('focusout', modelValue)"
      @keyup.enter="emit('handle-enter')"
    />
    <datalist v-if="datalist" :id="normalizedDatalistId">
      <option v-for="option in datalist" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </datalist>
    <label
      v-if="label"
      class="ps-input-label"
      :for="inputName"
      :class="{ active: showTitleTop }"
    >
      <span>{{ label }}</span>
      <span v-if="required" class="ps-input-required">
        {{ requiredStar }}
      </span>
    </label>
    <InfoBubble
      v-if="errorBubble || infoBubble"
      :customIcon="true"
      :message="errorBubble || infoBubble || ''"
      placement="top"
      class="ps-input-suffix bubble"
    >
      <Info :color="errorBubble ? '#f46a6a' : '#5d99b6'" class="error-icon" />
    </InfoBubble>
    <span v-else-if="suffix" class="ps-input-suffix"> {{ suffix }}</span>
    <IconButtonWrap
      v-if="clearable && !isEmpty"
      class="clear-button-wrap"
      :disabled="isDisabled"
      @click="emit('update:modelValue', '')"
    >
      <Cross />
    </IconButtonWrap>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { uidSingleton } from '@pubstudio/frontend/util-doc'
import { IDatalistOption } from '@pubstudio/frontend/type-ui-widgets'
import IconButtonWrap from '../IconButtonWrap.vue'
import Cross from '../svg/Cross.vue'
import InfoBubble from '../InfoBubble.vue'
import Info from '../svg/Info.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: number | string
    placeholder?: string
    label?: string | null
    type?: string
    name?: string
    autocomplete?: string
    errorBubble?: string | undefined
    infoBubble?: string | undefined
    isError?: boolean
    isDisabled?: boolean
    inputClass?: string | null
    maxLength?: number
    prefix?: string | null
    suffix?: string | null
    required?: boolean
    clearable?: boolean
    datalistId?: string
    datalist?: IDatalistOption[]
  }>(),
  {
    modelValue: '',
    placeholder: '',
    label: null,
    type: 'text',
    name: undefined,
    autocomplete: 'off',
    errorBubble: undefined,
    infoBubble: undefined,
    errorMessage: undefined,
    isDisabled: false,
    inputClass: null,
    maxLength: undefined,
    prefix: null,
    suffix: null,
    required: false,
    datalistId: undefined,
    datalist: undefined,
  },
)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'focusout', value: string | number | undefined): void
  (e: 'handle-enter'): void
}>()

const { type, name, placeholder, maxLength, modelValue, required, datalistId } =
  toRefs(props)

const inputRef = ref<HTMLInputElement>()

// TODO: consider adding an interface for the exposed value?
defineExpose({ inputRef })

const requiredStar = ` *`

const uid = uidSingleton.next()

const inputName = computed(() => {
  return name.value || `input${uid}`
})

const isEmpty = computed(() => {
  return String(modelValue.value) === ''
})

const normalizedDatalistId = computed(() => {
  if (datalistId.value) {
    // For some reason datalist id with '-' is not working in Vue 3
    return datalistId.value.replace(/-/g, '')
  }
  return undefined
})

const showTitleTop = computed(() => {
  return placeholder.value || modelValue.value || modelValue.value === 0
})

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement)?.value
  if (maxLength.value !== undefined) {
    const limitedValue = value.slice(0, maxLength.value)
    emit('update:modelValue', limitedValue)
    if (inputRef.value) {
      inputRef.value.value = limitedValue
    }
  } else {
    emit('update:modelValue', value)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.ps-input-wrap {
  position: relative;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;

  :deep(.error-message-wrap) {
    position: absolute;
  }
  .bubble {
    right: 8px;
  }
  .error-icon {
    @mixin size 18px;
    &:hover {
      :deep(svg g) {
        stroke: $color-light1;
      }
    }
  }
}

.ps-input-label {
  @mixin title-thin 15px;
  position: absolute;
  top: 12px;
  padding: 0 4px;
  margin-left: 12px;
  color: rgba(0, 0, 0, 0.6);
  transition: 0.2 ease all;
  pointer-events: none;
}

.ps-input-label.active,
.ps-input:focus ~ .ps-input-label {
  @mixin title-thin 11px;
  top: -9px;
  background-color: white;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  color: rgba(0, 0, 0, 0.9);
  padding-top: 2px;
}
.ps-input-required {
  color: $color-error;
}
.ps-input {
  @mixin text-medium 13px;
  box-sizing: border-box;
  color: $color-title;
  width: 100%;
  height: 40px;
  border-radius: 2px;
  border: 1px solid $color-light1;
  outline: none;
  outline-style: none;
  box-shadow: none;
  padding: 8px 10px;
  transition:
    border-color 0.3,
    background-color 0.3;

  &::placeholder {
    color: $color-title;
    opacity: 0.5;
  }

  &.has-prefix {
    padding-left: 64px;
  }

  &.has-suffix {
    padding-right: 32px;
  }

  &.has-icon-button {
    padding-right: 48px;
  }

  &:focus {
    border-color: $color-primary;
    background-color: white;
    &::-webkit-input-placeholder {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &.error {
    border: 1px solid $color-error-border;
    color: $color-error-light;
    background-color: $color-error-bg;
    &:not(:disabled)::placeholder {
      color: $color-error-light;
    }
  }

  &:disabled {
    border: 1px solid $grey-300;
    color: $color-disabled;
    -webkit-text-fill-color: $color-disabled;
    background-color: $grey-100;
  }

  /* stylelint-disable */
  &:-internal-autofill-selected,
  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus,
  &:-webkit-autofill:active {
    /* Disable background color of input autocomplete */
    box-shadow: 0 0 0 100px #fff inset !important;
    font-size: initial !important;
  }
  /* stylelint-enable */

  &[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
  }
  &[type='number']::-webkit-inner-spin-button,
  &[type='number']::-webkit-outer-spin-button {
    appearance: none;
    -webkit-appearance: none;
    margin: 0;
  }
}

textarea.ps-input {
  height: auto;
  padding: 8px;
}

.ps-input-prefix {
  @mixin text-medium 16px;
  color: $color-text;
  position: absolute;
  top: 16px;
  left: 14px;
}

.ps-input-suffix {
  @mixin text-medium 14px;
  color: $color-text;
  position: absolute;
  top: 10px;
  right: 12px;
}

:deep(.icon-button-wrap) {
  position: absolute;
  top: 11px;
  right: 20px;
}

.bo {
  border: 1px solid red;
}

@media (max-width: 680px) {
  .ps-input-wrap {
    border-radius: 16px;
  }
}
</style>
