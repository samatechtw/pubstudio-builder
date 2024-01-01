<template>
  <div class="component-styles">
    <EditMenuTitle
      :title="t('style.styles')"
      :collapsed="collapsed"
      :showAdd="!isEditing('')"
      @add="addStyle"
      @toggleCollapse="toggleCollapse"
    >
      <div class="sub-label" @click="clickSubTitle">
        {{ menuSubTitle }}
      </div>
      <IconTooltipDelay ref="toMixinRef" :tip="t('style.to_mixin')" class="to-mixin">
        <ScaleIn @click="convertToMixin"></ScaleIn>
      </IconTooltipDelay>
    </EditMenuTitle>
    <div class="style-rows" :class="{ collapsed }">
      <StyleRow
        v-for="entry in styleEntries"
        :key="`s-${entry.property}`"
        :style="entry"
        :editing="isEditing(entry.property)"
        :omitEditProperties="nonInheritedProperties"
        :error="!resolveThemeVariables(site.context, entry.value)"
        class="menu-row"
        @setProperty="setProperty(entry, $event)"
        @setValue="setValue(entry, $event)"
        @edit="editStyle(entry.property)"
        @save="saveStyle(entry.property)"
        @remove="removeStyle(entry)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import {
  ComponentMenuCollapsible,
  Css,
  StyleToolbarMenu,
} from '@pubstudio/shared/type-site'
import { IconTooltipDelay, ScaleIn } from '@pubstudio/frontend/ui-widgets'
import {
  useBuild,
  useReusableStyleMenu,
  useEditComponentStyles,
} from '@pubstudio/frontend/feature-build'
import {
  setStyleToolbarMenu,
  setComponentMenuCollapses,
} from '@pubstudio/frontend/util-command'
import StyleRow from '../StyleRow.vue'
import EditMenuTitle from '../EditMenuTitle.vue'

const { t } = useI18n()
const { site, editor, currentPseudoClass, selectedComponentFlattenedStyles } = useBuild()
const { newStyle } = useReusableStyleMenu()
const {
  styleEntries,
  editStyle,
  createStyle,
  setProperty,
  setValue,
  saveStyle,
  removeStyle,
  isEditing,
  nonInheritedProperties,
  editStyles,
} = useEditComponentStyles()

const toMixinRef = ref()

const collapsed = computed(
  () => !!editor.value?.componentMenuCollapses?.[ComponentMenuCollapsible.Styles],
)

const toggleCollapse = () => {
  setComponentMenuCollapses(
    editor.value,
    ComponentMenuCollapsible.Styles,
    !collapsed.value,
  )
}

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

const addStyle = () => {
  setComponentMenuCollapses(editor.value, ComponentMenuCollapsible.Styles, false)
  createStyle()
}

const styleRowHeight = computed(() => {
  const getEditingHeight = (prop: string): number => {
    const val = selectedComponentFlattenedStyles.value[prop as Css]?.value ?? ''
    const wrap = prop.length > 16 || val.length > 12
    return wrap ? 91 : 51
  }
  const editing = Array.from(editStyles.value ?? [])
  const editHeight = editing.map(getEditingHeight).reduce((prev, cur) => prev + cur, 0)
  const viewing = styleEntries.value.length - editing.length
  return editHeight + viewing * 37
})

const clickSubTitle = () => {
  const newVal =
    editor.value?.styleMenu === StyleToolbarMenu.PseudoClass
      ? undefined
      : StyleToolbarMenu.PseudoClass
  setStyleToolbarMenu(editor.value, newVal)
}

const convertToMixin = () => {
  toMixinRef.value?.cancelHoverTimer()
  const cmp = editor.value?.selectedComponent
  if (cmp) {
    newStyle(cmp)
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-styles {
  padding: 0 16px;
  width: 100%;
}
.sub-label {
  cursor: pointer;
  margin: 0 8px 0 0;
}
.to-mixin {
  @mixin size 22px;
  margin-right: auto;
  :deep(svg) {
    @mixin size 100%;
  }
  &:hover :deep(path) {
    fill: $color-toolbar-button-active;
  }
}
.tooltip {
  @mixin tooltip;
  margin-bottom: 8px;
}
.style-rows {
  transition: max-height 0.2s;
  overflow: visible;
  max-height: v-bind(styleRowHeight + 'px');
  &.collapsed {
    max-height: 0;
    overflow: hidden;
  }
}
</style>
