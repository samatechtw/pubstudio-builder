<template>
  <div v-if="editing" class="style-row">
    <div class="label" :class="{ 'edit-wrap': editWrap }">
      <StyleProperty
        :modelValue="style.property"
        class="property-multiselect"
        :openInitial="focusProp"
        @update:modelValue="updateProperty"
        @keydown.enter="updateProperty"
      />
      <StyleValue
        v-if="valueOptions"
        ref="valueSelectRef"
        :modelValue="style.value"
        class="value-multiselect"
        :options="valueOptions"
        @update:modelValue="updateValue"
      />
      <PSInput
        v-else
        ref="valueInputRef"
        :modelValue="style.value"
        class="value-input"
        :placeholder="t('value')"
        :isError="!!valueErrorMessage"
        @update:modelValue="updateValue"
        @keydown.enter="saveStyle"
        @keyup.esc="escapePressed"
      />
    </div>
    <div class="item">
      <Check class="item-save" color="#009879" @click.stop="saveStyle" />
      <Minus class="item-delete" @click.stop="removeStyle" />
    </div>
  </div>
  <div v-else class="style">
    <div class="label">
      {{ propertyText }}
    </div>
    <div class="value-preview" :class="{ error, ['value-inherited']: inheritedFrom }">
      {{ style?.value }}
    </div>
    <Edit class="edit-icon" @click="edit" />
    <Minus v-if="!inheritedFrom" class="item-delete" @click.stop="removeStyle" />
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
import { useI18n } from 'petite-vue-i18n'
import { StyleProperty, StyleValue } from '@pubstudio/frontend/ui-widgets'
import { Check, Edit, InfoBubble, Minus, PSInput } from '@pubstudio/frontend/ui-widgets'
import { Css, CssPseudoClass, cssValues, IStyleEntry } from '@pubstudio/shared/type-site'
import { useBuild, validateCssValue } from '@pubstudio/frontend/feature-build'

const { t } = useI18n()
const { site } = useBuild()

const props = withDefaults(
  defineProps<{
    editing?: boolean
    style: IStyleProp
    error?: boolean
    inheritedFrom?: string
    focusProp?: boolean
  }>(),
  {
    inheritedFrom: undefined,
  },
)
const { focusProp, editing, style, inheritedFrom } = toRefs(props)

const emit = defineEmits<{
  (e: 'edit', propName: string): void
  (e: 'setProperty', prop: Css): void
  (e: 'setValue', val: string): void
  (e: 'save'): void
  (e: 'escape', originalStyle: IStyleEntry): void
  (e: 'remove'): void
}>()

const valueInputRef = ref()
const valueSelectRef = ref()

const valueOptions = computed(() => {
  const prop = style.value?.property
  return prop ? cssValues.get(prop) : undefined
})

// Wrap the property/value inputs when they overflow
const editWrap = computed(() => {
  const s = style.value
  return editing.value && (s.property.length > 16 || s.value.length > 12)
})

const escapePressed = (event: KeyboardEvent) => {
  /*
  const el = event.target as HTMLElement | undefined
  el?.blur()
  emit('escape', originalStyle)
  */
}

const propertyText = computed(() => {
  if (style.value?.pseudoClass === CssPseudoClass.Default) {
    return style.value.property
  } else {
    return `${style.value.pseudoClass} ${style.value.property}`
  }
})

const focusValue = async () => {
  await nextTick()
  if (valueOptions.value) {
    try {
      ;(document.activeElement as HTMLElement).blur()
    } catch (_e) {
      //
    }
    if (!style.value.value) {
      setTimeout(() => valueSelectRef.value?.toggleDropdown(), 1)
    }
  } else {
    // TODO -- look into why nextTick isn't enough here
    setTimeout(() => valueInputRef.value?.inputRef.focus(), 1)
  }
}

const edit = async () => {
  emit('edit', style.value.property)
  if (!focusProp.value) {
    focusValue()
  }
}

const updateProperty = (property: Css) => {
  emit('setProperty', property)
  focusValue()
}

const isValueValid = computed(() =>
  validateCssValue(site.value.context, style.value.property, style.value.value),
)

const valueErrorMessage = computed(() => {
  if (!isValueValid.value) {
    return t('build.invalid_value')
  } else {
    return undefined
  }
})

const updateValue = (value: string) => {
  emit('setValue', value)
}

const saveStyle = () => {
  if (style.value.property && isValueValid.value) {
    emit('save')
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
  .label {
    margin-right: 0;
  }
}
.label {
  flex-grow: 1;
  display: flex;
  align-items: center;
}
.value-preview {
  @mixin text 14px;
  @mixin truncate;
  &.value-inherited {
    cursor: default;
    color: $color-disabled;
  }
}
.error {
  color: $color-error;
}
.edit-icon {
  flex-shrink: 0;
}
.item {
  margin-left: auto;
  flex-shrink: 0;
}
.property-multiselect {
  width: 100%;
  max-width: 130px;
  height: 34px;
}
.value-multiselect {
  width: auto;
  min-width: 110px;
  margin-left: 6px;
  height: 34px;
}
.value-input {
  max-width: 110px;
  width: 110px;
  margin-left: 6px;
  :deep(.ps-input) {
    height: 34px;
  }
}
.edit-wrap {
  flex-wrap: wrap;
  max-width: 240px;
  > * {
    width: 100%;
    max-width: unset;
    flex-grow: 1;
  }
  .value-multiselect,
  .value-input {
    margin: 6px 0 0 0;
  }
}

.inherited-from {
  margin-left: 8px;
}
</style>
