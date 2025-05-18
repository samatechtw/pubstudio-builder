<template>
  <div class="style-row-wrap">
    <div v-if="editing" class="style-row menu-row">
      <div class="label" :class="{ 'edit-wrap': editWrap }">
        <StyleProperty
          :modelValue="style.property"
          class="property-multiselect"
          :openInitial="!style.property"
          :omitEditProperties="omitEditProperties"
          @update:modelValue="updateProperty"
        />
        <StyleValue
          v-if="valueOptions"
          ref="valueSelectRef"
          :modelValue="style.value"
          class="value-multiselect"
          :options="valueOptions"
          @keyup="checkEscape"
          @update:modelValue="updateValue"
        />
        <STInput
          v-else
          ref="valueInputRef"
          :modelValue="style.value"
          class="value-input"
          :class="{ small: showAssetButton }"
          :placeholder="t('value')"
          :isError="!!valueErrorMessage"
          @update:modelValue="updateValue"
          @keyup.enter="saveStyle"
          @keyup.esc="saveStyle"
        />
      </div>
      <div class="item">
        <Assets
          v-if="showAssetButton"
          class="edit-icon background-asset-icon"
          @click="showSelectAssetModal = true"
        />
        <Check class="item-save" color="#009879" @click.stop="saveStyle" />
        <Minus class="item-delete" @click.stop="removeStyle" />
      </div>
    </div>
    <div v-else class="style menu-row">
      <div class="label">
        {{ propertyText }}
      </div>
      <div
        v-if="!moveToMixinOptions"
        class="value-preview"
        :class="{ error, ['value-inherited']: style.inheritedFrom }"
      >
        {{ style?.value }}
      </div>
      <Assets
        v-if="showAssetButton"
        class="edit-icon background-asset-icon"
        @click="showSelectAssetModal = true"
      />
      <STMultiselect
        v-if="moveToMixinOptions"
        :value="undefined"
        valueKey="id"
        labelKey="name"
        :placeholder="t('style.select')"
        :options="moveToMixinOptions"
        :clearable="false"
        :openInitial="true"
        class="move-to-mixin-select"
        @close="closeMoveToMixin"
        @select="selectMoveToMixin($event as IStyle)"
      />
      <IconTooltipDelay
        v-else-if="
          allowMoveToMixin && builderContext.shiftPressed.value && !style.inheritedFrom
        "
        ref="moveToMixinRef"
        :tip="t('style.move_to_mixin')"
        class="move-to-mixin"
      >
        <Grow class="move-icon" @click="moveToMixin" />
      </IconTooltipDelay>
      <Edit v-else class="edit-icon" @click="edit" />
      <Minus
        v-if="!moveToMixinOptions && !style.inheritedFrom"
        class="item-delete"
        @click.stop="removeStyle"
      />
      <InfoBubble
        v-if="style.inheritedFrom"
        class="inherited-from"
        :message="style.inheritedFrom"
      />
    </div>
    <SelectAssetModal
      v-if="showAssetButton"
      :show="showSelectAssetModal"
      :initialSiteId="siteId"
      :contentTypes="contentTypes"
      @cancel="showSelectAssetModal = false"
      @select="onBackgroundAssetSelected"
      @externalUrl="onBackgroundUrlSelected"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput, STMultiselect } from '@samatech/vue-components'
import {
  Grow,
  IconTooltipDelay,
  StyleProperty,
  StyleValue,
} from '@pubstudio/frontend/ui-widgets'
import { Assets, Check, Edit, InfoBubble, Minus } from '@pubstudio/frontend/ui-widgets'
import {
  Css,
  CssPseudoClass,
  IInheritedStyleEntry,
  IStyle,
  Keys,
} from '@pubstudio/shared/type-site'
import { useSelectAsset, validateCssValue } from '@pubstudio/frontend/feature-build'
import { SelectAssetModal } from '@pubstudio/frontend/feature-site-assets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import { replaceBackground } from '@pubstudio/frontend/util-component'
import { builderContext } from '@pubstudio/frontend/util-builder'
import { CSS_VALUES } from './style-values'

const { t } = useI18n()
const { site, editor } = useSiteSource()
const { showSelectAssetModal, contentTypes } = useSelectAsset()

const { editing, style } = defineProps<{
  editing?: boolean
  omitEditProperties: string[]
  style: IInheritedStyleEntry
  error?: boolean
  focusProp?: boolean
  allowMoveToMixin?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', propName: string): void
  (e: 'moveToMixin', mixinId: string): void
  (e: 'setProperty', prop: Css): void
  (e: 'setValue', val: string): void
  (e: 'save'): void
  (e: 'remove'): void
}>()

const valueInputRef = ref<InstanceType<typeof STInput> | undefined>()
const valueSelectRef = ref()
const moveToMixinRef = ref()
const moveToMixinOptions = ref()

const valueOptions = computed(() => {
  const prop = style?.property
  return prop ? CSS_VALUES.get(prop) : undefined
})

// Wrap the property/value inputs when they overflow
const editWrap = computed(() => {
  const s = style.value
  if (editing) {
    if ([Css.Background, Css.BackgroundImage].includes(s as Css)) {
      return s.length > 10
    }
    return s.length > 16 || s.length > 12
  }
  return false
})

const propertyText = computed(() => {
  if (style?.pseudoClass === CssPseudoClass.Default) {
    return style.property
  } else {
    return `${style.pseudoClass} ${style.property}`
  }
})

const showAssetButton = computed(
  () => style.property === Css.Background || style.property === Css.BackgroundImage,
)

const { siteStore } = useSiteSource()

const siteId = computed(
  () =>
    // `siteId` is unwrapped by ref, so it's actually a string instead of a Ref<string>.
    siteStore.siteId as unknown as string,
)

const focusValue = async () => {
  await nextTick()
  if (valueOptions.value) {
    try {
      ;(document.activeElement as HTMLElement).blur()
    } catch (_e) {
      //
    }
    if (!style.value) {
      setTimeout(() => valueSelectRef.value?.toggleDropdown(), 1)
    }
  } else {
    // TODO -- look into why nextTick isn't enough here
    setTimeout(() => {
      valueInputRef.value?.inputRef?.focus()
    }, 1)
  }
}

const edit = async () => {
  emit('edit', style.property)
  if (style.property) {
    focusValue()
  }
}

const moveToMixin = () => {
  moveToMixinRef.value?.cancelHoverTimer()

  const component = editor.value?.selectedComponent
  const mixinId = component?.style?.mixins?.[0]
  if (!style.inheritedFrom && component && mixinId) {
    const mixins = component.style?.mixins
    if (mixins && mixins.length > 1) {
      // Show dropdown with mixin options
      moveToMixinOptions.value = component.style?.mixins
        ?.map((mId) => site.value.context.styles[mId])
        .filter((m) => !!m)
    } else {
      // Move to only available mixin
      emit('moveToMixin', mixinId)
    }
  }
}

const selectMoveToMixin = (mixin: IStyle) => {
  moveToMixinOptions.value = undefined
  emit('moveToMixin', mixin.id)
}

const closeMoveToMixin = () => {
  moveToMixinOptions.value = undefined
}

const updateProperty = (property: Css) => {
  emit('setProperty', property)
  focusValue()
}

const isValueValid = computed(() =>
  validateCssValue(site.value.context, style.property, style.value),
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

const checkEscape = (e: KeyboardEvent) => {
  if (e.key === Keys.Escape) {
    saveStyle()
  }
}

const saveStyle = () => {
  if (style.property && isValueValid.value) {
    emit('save')
  } else if (!style.property && !style.value) {
    // Clear empty style on save
    emit('remove')
  }
}

const removeStyle = () => {
  emit('remove')
}

const onBackgroundAssetSelected = (asset: ISiteAssetViewModel) => {
  const assetUrl = urlFromAsset(asset)
  onBackgroundUrlSelected(assetUrl)
}

const onBackgroundUrlSelected = (url: string) => {
  if (style.property === Css.Background) {
    const newValue = replaceBackground(style.value, url)
    updateValue(newValue)
    saveStyle()
  } else if (style.property === Css.BackgroundImage) {
    updateValue(`url("${url}")`)
    saveStyle()
  }
  showSelectAssetModal.value = false
}

onMounted(() => {
  // Component is re-mounted on property change. Ideally we would avoid this,
  // but it's difficult because there is no consistent key in that case
  if (style.property) {
    focusValue()
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.style-row-wrap {
  display: flex;
  width: 100%;
}
.style-row,
.style {
  display: flex;
  position: relative;
  font-size: 14px;
  padding: 8px 0;
}
.style-row {
  :deep(.st-multiselect:hover) {
    border: 1px solid $color-primary;
  }
  .label {
    margin-right: 0;
    flex-shrink: 1;
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
.edit-icon,
.move-icon {
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
  :deep(.st-input) {
    height: 34px;
  }
}
.small {
  max-width: 88px;
  width: 88px;
}
.move-to-mixin {
  display: flex;
  align-items: center;
}
.move-to-mixin-select {
  position: absolute;
  right: 8px;
  top: 0;
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
  :deep(.st-input-wrap.st-ms-search) {
    flex-grow: 1;
  }
}

.inherited-from {
  margin-left: 8px;
}
</style>
