<template>
  <div v-if="editing" class="style-row">
    <div class="label">
      <StyleProperty
        :modelValue="newStyle.property"
        class="property-multiselect"
        :openInitial="focusProp"
        @update:modelValue="updateProperty"
        @keydown.enter="updateProperty"
      />
      <StyleValue
        v-if="valueOptions"
        ref="valueSelectRef"
        :modelValue="newStyle.value"
        class="value-multiselect"
        :options="valueOptions"
        @update:modelValue="updateValue"
      />
      <PSInput
        v-else
        ref="valueInputRef"
        :modelValue="newStyle.value"
        class="value-input"
        :placeholder="t('value')"
        :isError="!!valueErrorMessage"
        @update:modelValue="updateValue"
        @keydown.enter="updateStyle"
        @keyup.esc="escapePressed"
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
    style?: IStyleProp
    error?: boolean
    inheritedFrom?: string
    focusProp?: boolean
  }>(),
  {
    style: undefined,
    inheritedFrom: undefined,
  },
)
const { focusProp, editing, style, inheritedFrom } = toRefs(props)

const emit = defineEmits<{
  (e: 'edit', propName: string): void
  (e: 'update', newStyle: IStyleEntry): void
  (e: 'save', newStyle: IStyleEntry): void
  (e: 'escape', originalStyle: IStyleEntry): void
  (e: 'remove'): void
}>()

const valueInputRef = ref()
const valueSelectRef = ref()
const newStyle = ref<IStyleEntry>(propStyleOrNewStyle())
let originalStyle = propStyleOrNewStyle()

const valueOptions = computed(() => cssValues.get(newStyle.value.property))

const escapePressed = (event: KeyboardEvent) => {
  const el = event.target as HTMLElement | undefined
  el?.blur()
  emit('escape', originalStyle)
}

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

const propertyText = computed(() => {
  if (newStyle.value.pseudoClass === CssPseudoClass.Default) {
    return newStyle.value.property
  } else {
    return `${newStyle.value.pseudoClass} ${newStyle.value.property}`
  }
})

const focusValue = async () => {
  await nextTick()
  // TODO -- decide if/how to autofocus value multiselect
  if (valueOptions.value) {
    try {
      ;(document.activeElement as HTMLElement).blur()
    } catch (_e) {
      //
    }
    if (!newStyle.value.value) {
      setTimeout(() => valueSelectRef.value?.toggleDropdown(), 1)
    }
  } else {
    // TODO -- look into why nextTick isn't enough here
    setTimeout(() => valueInputRef.value?.inputRef.focus(), 1)
  }
}

const edit = async () => {
  newStyle.value = propStyleOrNewStyle()
  originalStyle = propStyleOrNewStyle()
  emit('edit', newStyle.value.property)
  if (!focusProp.value) {
    focusValue()
  }
}

const updateProperty = (property: Css) => {
  newStyle.value.property = property
  emit('update', newStyle.value)
  focusValue()
}

const isValueValid = computed(() =>
  validateCssValue(site.value.context, newStyle.value.property, newStyle.value.value),
)

const valueErrorMessage = computed(() => {
  if (!isValueValid.value) {
    return t('build.invalid_value')
  } else {
    return undefined
  }
})

const updateValue = (value: string) => {
  newStyle.value.value = value
  emit('update', newStyle.value)
}

const updateStyle = () => {
  if (newStyle.value.property && isValueValid.value) {
    emit('save', newStyle.value)
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
  width: 100%;
  max-width: 120px;
  height: 34px;
}
.value-multiselect {
  width: auto;
  min-width: 100px;
  margin-left: 6px;
}
.value-input {
  max-width: 114px;
  width: 114px;
  margin-left: 6px;
  :deep(.ps-input) {
    height: 34px;
  }
}

.inherited-from {
  margin-left: 8px;
}
</style>
