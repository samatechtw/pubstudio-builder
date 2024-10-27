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
          @keydown.enter="saveStyle"
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
      <Edit class="edit-icon" @click="edit" />
      <Minus v-if="!style.inheritedFrom" class="item-delete" @click.stop="removeStyle" />
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
import { computed, nextTick, onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { StyleProperty, StyleValue } from '@pubstudio/frontend/ui-widgets'
import { Assets, Check, Edit, InfoBubble, Minus } from '@pubstudio/frontend/ui-widgets'
import {
  Css,
  CssPseudoClass,
  IInheritedStyleEntry,
  Keys,
} from '@pubstudio/shared/type-site'
import {
  useBuild,
  useSelectAsset,
  validateCssValue,
} from '@pubstudio/frontend/feature-build'
import { SelectAssetModal } from '@pubstudio/frontend/feature-site-assets'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'
import { ISiteAssetViewModel } from '@pubstudio/shared/type-api-platform-site-asset'
import { urlFromAsset } from '@pubstudio/frontend/util-asset'
import { replaceBackground } from '@pubstudio/frontend/util-component'

// Items listed here will be used to populate the dropdown in editor, disabling users
// from entering custom values.
// Only non-numeric, dynamic values should be listed here.
const OVERFLOW = ['auto', 'hidden', 'scroll', 'visible']
const cssValues = new Map<Css, string[]>([
  [
    Css.AlignContent,
    ['center', 'flex-end', 'flex-start', 'space-around', 'space-between', 'stretch'],
  ],
  [Css.AlignItems, ['baseline', 'center', 'flex-end', 'flex-start', 'stretch']],
  [Css.AlignSelf, ['baseline', 'center', 'flex-end', 'flex-start', 'stretch']],
  [Css.BackgroundOrigin, ['border-box', 'content-box', 'padding-box']],
  [Css.Cursor, ['auto', 'default', 'none', 'pointer', 'text']],
  [Css.Display, ['block', 'flex', 'inline', 'inline-block', 'none']],
  [Css.FlexDirection, ['column', 'column-reverse', 'row', 'row-reverse']],
  [Css.FlexWrap, ['nowrap', 'wrap', 'wrap-reverse']],
  [Css.FontStyle, ['italic', 'normal']],
  [Css.FontWeight, ['100', '300', '400', '500', '600', '700']],
  [
    Css.JustifyContent,
    ['center', 'flex-end', 'flex-start', 'space-around', 'space-between', 'stretch'],
  ],
  [Css.ObjectFit, ['contain', 'cover', 'fill', 'none', 'scale-down']],
  [Css.Overflow, OVERFLOW],
  [Css.OverflowX, OVERFLOW],
  [Css.OverflowY, OVERFLOW],
  [Css.PointerEvents, ['auto', 'none']],
  [Css.Position, ['absolute', 'fixed', 'relative', 'static', 'sticky']],
  [Css.ScrollBehavior, ['auto', 'smooth']],
  [Css.TextAlign, ['start', 'end', 'justify', 'center']],
  [Css.TextOverflow, ['clip', 'ellipsis']],
  [Css.TextTransform, ['capitalize', 'uppercase', 'lowercase', 'none', 'full-width']],
  [Css.UserSelect, ['all', 'auto', 'none', 'text']],
  [Css.Visibility, ['hidden', 'visible']],
  [Css.WebkitBackgroundClip, ['border-box', 'padding-box', 'content-box', 'text']],
  [Css.WhiteSpace, ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap']],
  [Css.WordBreak, ['break-all', 'keep-all', 'normal']],
  [Css.WordWrap, ['break-word', 'normal']],
])

const { t } = useI18n()
const { site } = useBuild()
const { showSelectAssetModal, contentTypes } = useSelectAsset()

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

const valueInputRef = ref<InstanceType<typeof STInput> | undefined>()
const valueSelectRef = ref()

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
  onBackgroundUrlSelected(assetUrl)
}

const onBackgroundUrlSelected = (url: string) => {
  if (style.value.property === Css.Background) {
    const newValue = replaceBackground(style.value.value, url)
    updateValue(newValue)
    saveStyle()
  } else if (style.value.property === Css.BackgroundImage) {
    updateValue(`url("${url}")`)
    saveStyle()
  }
  showSelectAssetModal.value = false
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

.style-row-wrap {
  display: flex;
  width: 100%;
}
.style-row,
.style {
  display: flex;
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
  :deep(.st-input) {
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
  :deep(.st-input-wrap.search) {
    flex-grow: 1;
  }
}

.inherited-from {
  margin-left: 8px;
}
</style>
