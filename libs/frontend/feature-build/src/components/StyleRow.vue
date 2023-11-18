<template>
  <div v-if="editing" class="style-row">
    <div class="label">
      <StyleProperty
        :modelValue="model.property"
        class="property-multiselect"
        :openInitial="focusProp"
        @update:modelValue="updateProperty"
        @keydown.enter="updateStyle"
      />
      <StyleValue
        v-if="valueOptions"
        :modelValue="model.value"
        class="value-multiselect"
        :options="valueOptions"
        @update:modelValue="updateValue"
      />
      <PSInput
        v-else
        ref="valueInputRef"
        :modelValue="model.value"
        class="value-input"
        :placeholder="t('value')"
        :isError="!!valueErrorMessage"
        @update:modelValue="updateValue"
        @keydown.enter="updateStyle"
        @keyup.esc="$event.srcElement.blur()"
      />
    </div>
    <div class="item">
      <Check class="item-save" color="#009879" @click.stop="updateStyle" />
      <Minus class="item-delete" @click.stop="removeStyle" />
    </div>
  </div>
  <div v-else class="style">
    <div class="label">
      {{ propertyText }}
    </div>
    <div class="item">
      <div class="edit-item" :class="{ ['edit-item-inherited']: inheritedFrom }">
        <div class="value-preview" :class="{ error }">
          {{ model.value }}
        </div>
        <Edit class="edit-icon" @click="edit" />
      </div>
      <Minus v-if="!inheritedFrom" class="item-delete" @click.stop="removeStyle" />
    </div>
    <InfoBubble v-if="inheritedFrom" class="inherited-from" :message="inheritedFrom" />
  </div>
</template>

<script lang="ts">
interface IStyleProp extends Omit<IStyleEntry, 'pseudoClass'> {
  pseudoClass?: CssPseudoClass
}
</script>

<script lang="ts" setup>
import { computed, nextTick, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { StyleProperty, StyleValue } from '@pubstudio/frontend/ui-widgets'
import { Check, Edit, InfoBubble, Minus, PSInput } from '@pubstudio/frontend/ui-widgets'
import { Css, CssPseudoClass, cssValues, IStyleEntry } from '@pubstudio/shared/type-site'
import { validateCssValue } from '../lib/validate-css-value'
import { useBuild } from '../lib/use-build'

const { t } = useI18n()
const { site } = useBuild()

const props = withDefaults(
  defineProps<{
    editing?: boolean
    immediateUpdate?: boolean
    style?: IStyleProp
    error?: boolean
    inheritedFrom?: string
    modelValue?: IStyleEntry
    focusProp?: boolean
  }>(),
  {
    immediateUpdate: false,
    style: undefined,
    inheritedFrom: undefined,
    modelValue: undefined,
  },
)
const { focusProp, editing, immediateUpdate, style, inheritedFrom, modelValue } =
  toRefs(props)

const emit = defineEmits<{
  (e: 'edit', propName: string): void
  (e: 'update', newStyle: IStyleEntry): void
  (e: 'remove'): void
  (e: 'update:modelValue', newStyle: IStyleEntry): void
}>()

const valueInputRef = ref()
const newStyle = ref<IStyleEntry>(propStyleOrNewStyle())

const valueOptions = computed(() => cssValues.get(model.value.property))

function propStyleOrNewStyle(): IStyleEntry {
  if (style?.value) {
    // Use destructing assignment to prevent Ref from being passed by reference
    return { pseudoClass: CssPseudoClass.Default, ...style.value }
  }
  return {
    pseudoClass: CssPseudoClass.Default,
    property: Css.Empty,
    value: '',
  }
}

// In reusable styles menu, we want to save the pending values when the save button of reusable style
// is clicked, whether the user has saved the edited style entry or not.
// So both `modelValue` and `newStyle` are declared here for controlled and uncontrolled behavior,
// respectively.
// This means when editing a style entry, `modelValue` should be updated by emitting `update:modelValue`
// event, if it's present. Otherwise, update `newStyle`.
const model = computed(() => modelValue.value ?? newStyle.value)

const propertyText = computed(() => {
  if (model.value.pseudoClass === CssPseudoClass.Default) {
    return model.value.property
  } else {
    return `${model.value.pseudoClass} ${model.value.property}`
  }
})

const focusValue = async () => {
  await nextTick()
  // TODO -- look into why nextTick isn't enough here
  setTimeout(() => valueInputRef.value?.inputRef.focus(), 1)
}

const edit = async () => {
  newStyle.value = propStyleOrNewStyle()
  emit('edit', model.value.property)
  if (!focusProp.value) {
    focusValue()
  }
}

const updateProperty = (property: Css) => {
  if (modelValue.value) {
    const updatedEntry = {
      ...modelValue.value,
      property,
    }
    emit('update:modelValue', updatedEntry)
  } else {
    newStyle.value.property = property
  }
  // TODO -- decide if/how to autofocus value multiselect
  if (valueOptions.value) {
    try {
      ;(document.activeElement as HTMLElement).blur()
    } catch (_e) {
      //
    }
  }
  focusValue()
  if (immediateUpdate.value) {
    updateStyle()
  }
}

const isValueValid = computed(() =>
  validateCssValue(site.value.context, model.value.property, model.value.value),
)

const valueErrorMessage = computed(() => {
  if (!isValueValid.value) {
    return t('build.invalid_value')
  } else {
    return undefined
  }
})

const updateValue = (value: string) => {
  if (modelValue.value) {
    if (validateCssValue(site.value.context, modelValue.value.property, value)) {
      const updatedEntry = {
        ...modelValue.value,
        value,
      }
      emit('update:modelValue', updatedEntry)
    }
  } else {
    newStyle.value.value = value
  }
  if (immediateUpdate.value) {
    updateStyle()
  }
}

const updateStyle = () => {
  if (model.value.property && isValueValid.value) {
    emit('update', model.value)
  }
}

const removeStyle = () => {
  emit('remove')
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.style-row,
.style {
  font-size: 14px;
  padding: 8px 0;
}
.style-row {
  :deep(.ps-multiselect:hover) {
    border: 1px solid $color-primary;
  }
}

.item {
  display: flex;
  align-items: center;
  margin-left: 6px;
  overflow: hidden;
}

.edit-item {
  margin-left: auto;
  overflow: hidden;
  .value-preview {
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .error {
    color: $color-error;
  }
  .edit-icon {
    flex-shrink: 0;
  }
  &.edit-item-inherited {
    cursor: default;
    .value-preview {
      color: $color-disabled;
    }
  }
}

.label {
  flex-grow: 1;
  display: flex;
  align-items: center;
}
.item {
  margin-left: auto;
  flex-shrink: 0;
}
.property-multiselect {
  width: 130px;
}
.value-multiselect {
  width: auto;
  min-width: 100px;
  margin-left: 6px;
}
.value-input {
  min-width: 90px;
  flex-grow: 1;
  margin-left: 6px;
}

.inherited-from {
  margin-left: 8px;
}
</style>
