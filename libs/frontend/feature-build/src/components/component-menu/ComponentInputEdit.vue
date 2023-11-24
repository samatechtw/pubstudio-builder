<template>
  <div class="component-input-new">
    <MenuRow
      :label="t('name')"
      :value="newInput.name"
      :editable="!editInput"
      :forceEdit="!editInput"
      :immediateUpdate="true"
      :placeholder="t('name')"
      @update="newInput.name = $event ?? ''"
    />
    <MenuRow
      :label="t('type')"
      :value="newInput.type"
      :forceEdit="true"
      :focusInput="false"
      :immediateUpdate="true"
      :placeholder="t('value')"
      @update="newInput.type = $event as ComponentArgPrimitive"
    />
    <MenuRow
      :label="t('default')"
      :value="newInput.default"
      :forceEdit="true"
      :focusInput="false"
      :immediateUpdate="true"
      :placeholder="t('value')"
      @update="newInput.default = $event"
    />
    <div class="input-attr">
      <Checkbox
        :item="{ label: t('build.is_attr'), checked: newInput.attr }"
        @checked="newInput.attr = !newInput.attr"
      />
      <InfoBubble
        :message="t('build.attr_info')"
        :showArrow="false"
        class="info-bubble"
      />
    </div>
    <ErrorMessage :error="inputError" />
    <div class="input-actions">
      <PSButton
        class="save-button"
        :text="t('save')"
        :secondary="true"
        @click.stop="save"
      />
      <PSButton
        v-if="editInput"
        class="delete-button"
        :text="t('delete')"
        :secondary="true"
        @click.stop="emit('remove', editInput?.name as string)"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click.stop="emit('cancel')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ComponentArgPrimitive, IComponentInput } from '@pubstudio/shared/type-site'
import {
  Checkbox,
  ErrorMessage,
  InfoBubble,
  PSButton,
} from '@pubstudio/frontend/ui-widgets'
import MenuRow from '../MenuRow.vue'

const { t } = useI18n()

const props = defineProps<{
  editInput: IComponentInput | undefined
}>()
const { editInput } = toRefs(props)

const emit = defineEmits<{
  (e: 'save', input: IComponentInput): void
  (e: 'remove', name: string): void
  (e: 'cancel'): void
}>()

const newInput = ref<IComponentInput>(
  editInput.value ?? {
    name: '',
    type: ComponentArgPrimitive.String,
    default: '',
    attr: false,
    is: '',
  },
)
const inputError = ref()

const validateInput = (): boolean => {
  if (!newInput.value.name) {
    inputError.value = t('errors.input_name_length')
    return false
  }
  return true
}

const save = () => {
  inputError.value = undefined
  if (!validateInput()) {
    return
  }
  emit('save', {
    ...newInput.value,
    // Use `default` as the initial value of `is`
    is: newInput.value.default,
  })
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-input-new {
  padding: 16px;
}
.input-actions {
  @mixin menu-actions;
  > button {
    width: 31%;
  }
}
.input-attr {
  display: flex;
  align-items: center;
  padding: 12px 0;
  :deep(.checkbox) {
    align-items: center;
    margin: 0 8px 0 0;
  }
}
</style>
