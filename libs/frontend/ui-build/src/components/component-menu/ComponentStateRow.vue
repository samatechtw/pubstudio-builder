<template>
  <div class="state-row-wrap">
    <div v-if="editing" class="state-edit menu-row">
      <STInput
        v-model="editKey"
        class="key-input"
        :placeholder="t('key')"
        @keydown.enter="saveState"
        @keyup.esc="saveState"
      />
      <STInput
        v-model="editValue"
        class="value-input"
        :placeholder="t('value')"
        @keydown.enter="saveState"
        @keyup.esc="saveState"
      />
      <div class="item">
        <Check class="item-save" color="#009879" @click.stop="saveState" />
      </div>
    </div>
    <div v-else class="state menu-row">
      <div class="label">
        {{ stateKey }}
      </div>
      <PSToggle
        v-if="isBoolean"
        :on="stateVal.toString() === 'true'"
        :onText="t('true')"
        :offText="t('false')"
        small
        @toggle="emit('save', { key: stateKey, value: !stateVal })"
      />
      <div v-else class="value-preview">
        {{ stateVal }}
      </div>
      <Edit v-if="!isBoolean" class="edit-icon" @click="edit" />
      <Minus class="item-delete" @click.stop="emit('remove')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { Check, Edit, Minus, PSToggle } from '@pubstudio/frontend/ui-widgets'
import { IComponentState } from '@pubstudio/shared/type-site'
import { IEditComponentState } from './i-edit-component-state'

const { t } = useI18n()

const props = defineProps<{
  editing?: boolean
  stateKey: string
  stateVal: IComponentState
}>()
const { editing, stateKey, stateVal } = toRefs(props)
const editKey = ref()
const editValue = ref()

const emit = defineEmits<{
  (e: 'edit', stateKey: string): void
  (e: 'save', state: IEditComponentState): void
  (e: 'remove'): void
}>()

const edit = async () => {
  emit('edit', stateKey.value)
  editKey.value = stateKey.value
  editValue.value = stateVal.value
}

const isBoolean = computed(() => {
  return typeof stateVal.value === 'boolean'
})

const saveState = () => {
  if (editKey.value) {
    let val = editValue.value
    if (val === 'true') {
      val = true
    } else if (val === 'fase') {
      val = false
    }
    emit('save', { key: editKey.value, value: val })
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.state-row-wrap {
  display: flex;
  width: 100%;
}
.state-row {
  display: flex;
  font-size: 14px;
  padding: 8px 0;
}
.label {
  @mixin text 14px;
  flex-grow: 1;
  display: flex;
  align-items: center;
}
.value-preview {
  @mixin text 14px;
  @mixin truncate;
}
.edit-icon {
  flex-shrink: 0;
}
.item {
  margin-left: auto;
  flex-shrink: 0;
}
.key-input {
  max-width: 110px;
}
.value-input {
  margin-left: 6px;
}
:deep(.st-input) {
  height: 34px;
}
.edit-wrap {
  flex-wrap: wrap;
  max-width: 240px;
  .value-input {
    margin: 6px 0 0 0;
  }
  :deep(.st-input-wrap.st-ms-search) {
    flex-grow: 1;
  }
}
</style>
