<template>
  <div class="component-input-row menu-row">
    <div class="label">
      {{ property }}
    </div>
    <div v-if="editing" class="edit">
      <PSToggle
        v-if="argType === ComponentArgPrimitive.Boolean"
        :on="newValue?.toString() === 'true'"
        :onText="t('true')"
        :offText="t('false')"
        small
        class="is-toggle"
        @toggle="newValue = $event.toString()"
      />
      <STInput
        v-else
        ref="valueInputRef"
        v-model="newValue"
        :placeholder="t('value')"
        :datalistId="componentId"
        :datalist="datalist"
        :isError="!inputValid"
        class="value-input"
        @keydown.enter="updateValue"
        @keyup.esc="($event.target as HTMLInputElement)?.blur()"
      />
      <Check class="item-save" color="#009879" @click="updateValue" />
    </div>
    <template v-else>
      <div class="value-preview" :class="{ error }">
        {{ value }}
      </div>
      <Edit class="edit-icon edit-is" @click="edit" />
      <slot />
      <Settings
        v-if="showEditInput"
        class="edit-icon edit-input"
        @click="emit('editInput')"
      />
      <Minus v-else-if="showReset" class="reset-icon" @click="emit('reset')" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { Check, PSToggle, Edit, Minus } from '@pubstudio/frontend/ui-widgets'
import { IDatalistOption } from '@pubstudio/frontend/type-ui-widgets'
import { Settings } from '@pubstudio/frontend/ui-widgets'
import {
  ComponentArgType,
  ComponentArgPrimitive,
  TagType,
} from '@pubstudio/shared/type-site'
import {
  validateComponentArg,
  convertComponentArg,
  getLinkDatalistOptions,
} from '@pubstudio/frontend/feature-build'
import { setComponentEditInputValue } from '@pubstudio/frontend/data-access-command'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const { t } = useI18n()

const { site, editor } = useSiteSource()

const props = withDefaults(
  defineProps<{
    property: string
    value: string
    argType: ComponentArgType
    tag: TagType
    // For datalist in STInput
    componentId?: string
    showEditInput?: boolean
    showReset?: boolean
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
  (e: 'reset'): void
}>()

const newValue = ref(value.value)
const valueInputRef = ref<InstanceType<typeof STInput> | undefined>()

const editing = computed(() => {
  return editor.value?.componentTab.editInputValue === property.value
})

const inputValid = computed(() => validateComponentArg(argType.value, newValue.value))

const edit = async () => {
  setComponentEditInputValue(editor.value, property.value)
  newValue.value = value.value
  valueInputRef.value?.inputRef?.focus()
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
  if (tag.value === 'a' && property.value === 'href') {
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
.value-input {
  max-width: 140px;
  width: 140px;
  margin-left: 6px;
  :deep(.st-input) {
    height: 34px;
  }
}

.edit-icon {
  flex-shrink: 0;
}
.reset-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-left: 6px;
  cursor: pointer;
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
