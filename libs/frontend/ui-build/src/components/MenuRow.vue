<template>
  <div class="menu-row">
    <div class="label">
      {{ label }}
    </div>
    <slot v-if="editing || forceEdit" name="input">
      <STInput
        ref="newValueRef"
        v-model="newValue"
        class="item"
        :placeholder="placeholder"
        @update:modelValue="immediateSetValue"
        @keydown.enter="setValue"
        @keyup.esc="($event.target as HTMLInputElement)?.blur()"
      />
      <Check v-if="showCheck" class="item-save" color="#009879" @click="setValue" />
    </slot>
    <div
      v-else
      class="item edit-item"
      :class="{ uneditable: !editable }"
      @click="editValue"
    >
      {{ value || '' }}
      <slot name="item" />
      <Edit v-if="editable" class="edit-icon" />
      <Copy v-if="value && copyValue" class="copy-icon" @click="copy(value)" />
    </div>
    <InfoBubble
      v-if="info || infoKey"
      :message="info || t(infoKey as string)"
      :showArrow="false"
      class="info-bubble"
    />
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { Check, Copy, Edit, InfoBubble } from '@pubstudio/frontend/ui-widgets'
import { copy } from '@pubstudio/frontend/util-doc'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    label: string
    value?: string | undefined
    editable?: boolean
    info?: string
    infoKey?: string
    forceEdit?: boolean
    focusInput?: boolean
    placeholder?: string
    immediateUpdate?: boolean
    copyValue?: boolean
    showCheck?: boolean
  }>(),
  {
    value: undefined,
    editable: false,
    placeholder: undefined,
    focusInput: true,
    info: undefined,
    infoKey: undefined,
    showCheck: false,
  },
)
const { value, editable, focusInput, forceEdit, immediateUpdate } = toRefs(props)

const emit = defineEmits<{
  (e: 'update', value: string | undefined): void
}>()

const newValue = ref()
const newValueRef = ref<InstanceType<typeof STInput> | undefined>()
const editing = ref(false)

const editValue = async () => {
  if (editable.value) {
    editing.value = true
    newValue.value = value.value ?? ''
    await nextTick()
    newValueRef.value?.inputRef?.focus()
  }
}

const immediateSetValue = () => {
  if (immediateUpdate.value) {
    setValue()
  }
}

const setValue = () => {
  emit('update', newValue.value || undefined)
  editing.value = false
}

watch(value, (updatedValue) => {
  newValue.value = updatedValue
})

onMounted(async () => {
  if (forceEdit.value) {
    await nextTick()
    newValue.value = value.value ?? ''
    if (focusInput.value) {
      newValueRef.value?.inputRef?.focus()
    }
  }
})

defineExpose({ newValueRef })
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.label {
  @mixin title-bold 13px;
}
.item {
  margin-left: auto;
}
.edit-item {
  cursor: default;
}
.uneditable {
  cursor: default;
}
.info-bubble {
  margin-left: 8px;
}
:deep(.st-input) {
  padding: 0 10px;
  height: 32px;
}
</style>
