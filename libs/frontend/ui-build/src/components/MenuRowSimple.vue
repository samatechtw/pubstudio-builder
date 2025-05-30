<template>
  <div class="menu-row">
    <div class="label">
      {{ label }}
    </div>
    <STInput
      v-if="editing"
      ref="newValueRef"
      v-model="newValue"
      class="item"
      :placeholder="placeholder"
      @keydown.enter="setValue"
      @keyup.esc="($event.target as HTMLInputElement)?.blur()"
    />
    <div v-else class="item edit-item" @click="editValue">
      {{ value || '' }}
    </div>
    <Edit v-if="!editing && editable" class="edit-icon" @click="editValue" />
    <InfoBubble v-if="info" :message="info" :showArrow="false" class="info-bubble" />
  </div>
</template>

<script lang="ts" setup>
// This is a simplified version of `MenuRow.vue` that is always editable,
// and the editing state is controlled by the parent.
import { nextTick, ref, toRefs } from 'vue'
import { STInput } from '@samatech/vue-components'
import { Edit, InfoBubble } from '@pubstudio/frontend/ui-widgets'

const props = withDefaults(
  defineProps<{
    label: string
    value?: string | undefined
    editing: boolean
    editable: boolean
    info?: string
    placeholder?: string
  }>(),
  {
    value: undefined,
    placeholder: undefined,
    info: undefined,
  },
)
const { value, editing, editable } = toRefs(props)

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'update', value: string | undefined): void
}>()

const newValue = ref(value.value)
const newValueRef = ref<InstanceType<typeof STInput> | undefined>()

const editValue = async () => {
  if (editable.value) {
    emit('edit')
    newValue.value = value.value ?? ''
    await nextTick()
    newValueRef.value?.inputRef?.focus()
  }
}

const setValue = () => {
  emit('update', newValue.value || undefined)
}
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
  .edit-item {
    display: block;
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
}
</style>
