<template>
  <div class="component-input-row menu-row">
    <div class="label">
      {{ property }}
    </div>
    <div v-if="editing" class="edit">
      <Checkbox
        v-if="argType === ComponentArgPrimitive.Boolean"
        :item="{
          label: '',
          checked: ['true', true].includes(newValue),
        }"
        class="input-boolean"
        @checked="newValue = $event.toString()"
      />
      <PSInput
        v-else
        ref="valueInputRef"
        v-model="newValue"
        :placeholder="t('value')"
        :datalistId="componentId"
        :datalist="datalist"
        :isError="!inputValid"
        @keydown.enter="updateValue"
        @keyup.esc="$event.srcElement.blur()"
      />
      <Check class="item-save" color="#009879" @click="updateValue" />
    </div>
    <template v-else>
      <div class="value-preview" :class="{ error }">
        {{ value }}
      </div>
      <Edit class="edit-icon" @click="edit" />
      <slot />
      <Settings v-if="showEditInput" class="edit-icon" @click="emit('editInput')" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Check, Checkbox, Edit, PSInput } from '@pubstudio/frontend/ui-widgets'
import { IDatalistOption } from '@pubstudio/frontend/type-ui-widgets'
import { Settings } from '@pubstudio/frontend/ui-widgets'
import { ComponentArgType, ComponentArgPrimitive, Tag } from '@pubstudio/shared/type-site'
import {
  useBuild,
  validateComponentArg,
  convertComponentArg,
  getLinkDatalistOptions,
} from '@pubstudio/frontend/feature-build'
import { setComponentEditInputValue } from '@pubstudio/frontend/data-access-command'

const { t } = useI18n()

const { site, editor } = useBuild()

const props = withDefaults(
  defineProps<{
    property: string
    value: string
    argType: ComponentArgType
    tag: Tag
    // For datalist in PSInput
    componentId?: string
    showEditInput?: boolean
    error?: boolean
  }>(),
  {
    componentId: undefined,
    error: false,
  },
)

const { property, value, argType, tag, componentId, error } = toRefs(props)

const emit = defineEmits<{
  (e: 'update', value: unknown): void
  (e: 'editInput'): void
}>()

const newValue = ref(value.value)
const valueInputRef = ref()

const editing = computed(() => {
  return editor.value?.componentTab.editInputValue === property.value
})

const inputValid = computed(() => validateComponentArg(argType.value, newValue.value))

const edit = async () => {
  setComponentEditInputValue(editor.value, property.value)
  newValue.value = value.value
  valueInputRef.value?.inputRef.focus()
}

const updateValue = () => {
  if (inputValid.value) {
    // Convert value from string to target type before updating because the value
    // returned by an input element is always a string.
    const convertedValue = convertComponentArg(argType.value, newValue.value)
    emit('update', convertedValue)
    setComponentEditInputValue(editor.value, undefined)
  }
}

const datalist = computed<IDatalistOption[] | undefined>(() => {
  if (tag.value === Tag.A && property.value === 'href') {
    return getLinkDatalistOptions(site.value, componentId.value ?? '')
  }
  return undefined
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.label {
  @mixin text 14px;
}

.input-boolean {
  margin: 0;
}

.value-preview {
  @mixin truncate;
  @mixin text 14px;
  flex-grow: 1;
  text-align: end;
  color: $grey-700;
}

.edit-icon {
  flex-shrink: 0;
}
.menu-row .label {
  max-width: 100px;
  margin-right: 12px;
}
.edit {
  @mixin flex-row;
  align-items: center;
  margin-left: auto;
}
.error {
  color: $color-error;
}
</style>
