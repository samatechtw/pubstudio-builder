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
    >
      <template #input>
        <PSMultiselect
          class="input-type-multiselect"
          :value="newInput.type"
          :placeholder="t('type')"
          :options="Object.values(ComponentArgPrimitive)"
          @select="newInput.type = $event as ComponentArgPrimitive"
        />
      </template>
    </MenuRow>
    <MenuRow
      :label="t('default')"
      :value="newInput.default?.toString()"
      :forceEdit="true"
      :focusInput="false"
      :immediateUpdate="true"
    >
      <template #input>
        <PSToggle
          v-if="newInput.type === ComponentArgPrimitive.Boolean"
          :on="newInput.default?.toString() === 'true'"
          :onText="t('true')"
          :offText="t('false')"
          small
          class="default-toggle"
          @toggle="newInput.default = $event"
        />
        <PSInput
          v-else
          :modelValue="newInput.default?.toString()"
          class="default-text"
          :placeholder="t('value')"
          @update:modelValue="newInput.default = $event"
          @keyup.esc="($event.target as HTMLInputElement)?.blur()"
        />
      </template>
    </MenuRow>
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
        size="small"
        :secondary="true"
        @click.stop="save"
      />
      <PSButton
        v-if="editInput"
        class="delete-button"
        :text="t('delete')"
        size="small"
        :secondary="true"
        @click.stop="emit('remove', editInput?.name as string)"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        size="small"
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
  PSToggle,
  PSMultiselect,
  PSInput,
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
    attr: true,
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
.input-type-multiselect {
  width: 168px;
}
.input-actions {
  @mixin menu-actions;
  > button {
    margin: 0 3px;
    min-width: calc(33.3% - 6px);
    &:first-child {
      margin: 0 6px 0 0;
    }
    &:last-child {
      margin: 0 0 0 6px;
    }
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
