<template>
  <div v-if="editing" class="style-row">
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
      <PSInput
        v-else
        ref="valueInputRef"
        :modelValue="style.value"
        class="value-input"
        :class="{ small: showAssetButton }"
        :placeholder="t('value')"
        :isError="!!valueErrorMessage"
        @update:modelValue="updateValue"
        @keydown.enter="saveStyle"
        @keyup.esc="saveStyle"
      />
    </div>
    <div class="item">
      <Assets
        v-if="showAssetButton"
        class="edit-icon backgound-asset-icon"
        @click="showSelectAssetModal = true"
      />
      <Check class="item-save" color="#009879" @click.stop="saveStyle" />
      <Minus class="item-delete" @click.stop="removeStyle" />
    </div>
    <SelectAssetModal
      :show="showSelectAssetModal"
      :initialSiteId="siteId"
      :contentTypes="[AssetContentType.Jpeg, AssetContentType.Png, AssetContentType.Gif]"
      @cancel="showSelectAssetModal = false"
      @select="onBackgroundAssetSelected"
    />
  </div>
  <div v-else class="style">
    <div class="label">
      {{ propertyText }}
    </div>
    <div
      class="value-preview"
      :class="{ error, ['value-inherited']: style.inheritedFrom }"
    >
      {{ style?.value }}
    </div>
    <Assets
      v-if="showAssetButton"
      class="edit-icon backgound-asset-icon"
      @click="showSelectAssetModal = true"
    />
    <Edit class="edit-icon" @click="edit" />
    <Minus v-if="!style.inheritedFrom" class="item-delete" @click.stop="removeStyle" />
    <InfoBubble
      v-if="style.inheritedFrom"
      class="inherited-from"
      :message="style.inheritedFrom"
    />
    <SelectAssetModal
      :show="showSelectAssetModal"
      :initialSiteId="siteId"
      :contentTypes="[AssetContentType.Jpeg, AssetContentType.Png, AssetContentType.Gif]"
      @cancel="showSelectAssetModal = false"
      @select="onBackgroundAssetSelected"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { StyleProperty, StyleValue } from '@pubstudio/frontend/ui-widgets'
import {
  Assets,
  Check,
  Edit,
  InfoBubble,
  Minus,
  PSInput,
} from '@pubstudio/frontend/ui-widgets'
import {
  Css,
  CssPseudoClass,
  cssValues,
  IInheritedStyleEntry,
} from '@pubstudio/shared/type-site'
import { useBuild, validateCssValue } from '@pubstudio/frontend/feature-build'
import { Keys } from '@pubstudio/frontend/util-key-listener'
import { SelectAssetModal } from '@pubstudio/frontend/feature-site-assets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import {
  AssetContentType,
  ISiteAssetViewModel,
} from '@pubstudio/shared/type-api-platform-site-asset'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'

const { t } = useI18n()
const { site } = useBuild()

const props = defineProps<{
  editing?: boolean
  omitEditProperties: string[]
  style: IInheritedStyleEntry
  error?: boolean
  focusProp?: boolean
}>()
const { editing, style } = toRefs(props)

const emit = defineEmits<{
  (e: 'edit', propName: string): void
  (e: 'setProperty', prop: Css): void
  (e: 'setValue', val: string): void
  (e: 'save'): void
  (e: 'remove'): void
}>()

const valueInputRef = ref<InstanceType<typeof PSInput> | undefined>()
const valueSelectRef = ref()
const showSelectAssetModal = ref(false)

const valueOptions = computed(() => {
  const prop = style.value?.property
  return prop ? cssValues.get(prop) : undefined
})

// Wrap the property/value inputs when they overflow
const editWrap = computed(() => {
  const s = style.value
  if (editing.value) {
    if ([Css.Background, Css.BackgroundImage].includes(s.property)) {
      return s.value.length > 10
    }
    return s.property.length > 16 || s.value.length > 12
  }
  return false
})

const propertyText = computed(() => {
  if (style.value?.pseudoClass === CssPseudoClass.Default) {
    return style.value.property
  } else {
    return `${style.value.pseudoClass} ${style.value.property}`
  }
})

const showAssetButton = computed(
  () =>
    style.value.property === Css.Background ||
    style.value.property === Css.BackgroundImage,
)

const { siteStore } = useSiteSource()

const siteId = computed(
  () =>
    // `siteId` is unwrapped by ref, so it's actually a string instead of a Ref<string>.
    siteStore.value.siteId as unknown as string,
)

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
    setTimeout(() => {
      valueInputRef.value?.inputRef?.focus()
    }, 1)
  }
}

const edit = async () => {
  emit('edit', style.value.property)
  if (style.value.property) {
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

const checkEscape = (e: KeyboardEvent) => {
  if (e.key === Keys.Escape) {
    saveStyle()
  }
}

const saveStyle = () => {
  if (style.value.property && isValueValid.value) {
    emit('save')
  } else if (!style.value.property && !style.value.value) {
    // Clear empty style on save
    emit('remove')
  }
}

const removeStyle = () => {
  emit('remove')
}

const onBackgroundAssetSelected = (asset: ISiteAssetViewModel) => {
  const assetUrl = urlFromAsset(asset)
  if (style.value.property === Css.Background) {
    const newValue = replaceBackground(assetUrl)
    updateValue(newValue)
    saveStyle()
  } else if (style.value.property === Css.BackgroundImage) {
    updateValue(`url("${assetUrl}")`)
    saveStyle()
  }
  showSelectAssetModal.value = false
}

const replaceBackground = (assetUrl: string) => {
  const cssValue = `url("${assetUrl}")`
  const currentValue = style.value.value
  if (CSS.supports('background', currentValue)) {
    // Replace the background value and retain any non-url information.
    // Find a more efficient & comprehensive way to extract attributes from CSS value.
    const attributes = style.value.value
      .split(/([^\s]+|"[^"]+"|'[^']+')/g)
      .filter((value) => value.trim())
    const valueIndex = attributes.findIndex(
      (value) =>
        // url(...), radial-gradient(crimson, skyblue), etc.
        CSS.supports('background-image', value) ||
        // red, green, etc.
        CSS.supports('color', value),
    )
    attributes[valueIndex] = cssValue
    return attributes.join(' ')
  } else {
    return cssValue
  }
}

onMounted(() => {
  // Component is re-mounted on property change. Ideally we would avoid this,
  // but it's difficult because there is no consistent key in that case
  if (style.value.property) {
    focusValue()
  }
})
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
.small {
  max-width: 88px;
  width: 88px;
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
  :deep(.ps-input-wrap.search) {
    flex-grow: 1;
  }
}

.inherited-from {
  margin-left: 8px;
}
</style>
