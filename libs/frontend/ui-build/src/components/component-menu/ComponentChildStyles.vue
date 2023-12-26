<template>
  <div class="child-styles">
    <EditMenuTitle
      :title="t('style.child')"
      :collapsed="collapsed"
      :showAdd="selector !== undefined && !isMissingSelector(selector) && !isEditing('')"
      @add="addStyle"
      @toggleCollapse="toggleCollapse"
    >
      <InfoBubble :message="t('style.child_info')" placement="top" class="info" />
      <PSMultiselect
        v-slot="{ label }"
        :value="selector"
        :options="selectors"
        :placeholder="t('style.selector')"
        :customLabel="true"
        class="selector"
        :class="{
          'has-missing-selector': hasMissingSelector,
          'current-selector-missing': currentSelectorMissing,
        }"
        @select="setSelector"
        @close="labelLeave"
      >
        <div
          :class="{ 'missing-selector': isMissingSelector(label) }"
          @mouseenter="labelEnter(label)"
          @mouseleave="labelLeave"
        >
          {{ label }}
        </div>
      </PSMultiselect>
      <template v-if="selector !== undefined && isMissingSelector(selector)">
        <InfoBubble
          :message="t('style.child_missing_current')"
          color="#ef4444"
          placement="top"
          class="missing-info-current"
        />
        <Minus class="delete-selector" @click="removeSelector" />
      </template>
      <InfoBubble
        v-else-if="hasMissingSelector"
        :message="t('style.child_missing')"
        color="#ef4444"
        placement="top"
        class="missing-info"
      />
    </EditMenuTitle>
    <div class="style-rows" :class="{ collapsed }">
      <StyleRow
        v-for="entry in styleEntries"
        :key="`cs-${entry.property}`"
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
import { computed, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { InfoBubble, PSMultiselect, Minus } from '@pubstudio/frontend/ui-widgets'
import { ComponentMenuCollapsible, Css, IComponent } from '@pubstudio/shared/type-site'
import {
  useBuild,
  setComponentMenuCollapses,
  useEditComponentChildStyles,
} from '@pubstudio/frontend/feature-build'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import EditMenuTitle from '../EditMenuTitle.vue'
import StyleRow from '../StyleRow.vue'

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const { t } = useI18n()
const { site, editor, removeComponentOverrideStyle } = useBuild()
const {
  styleEntries,
  selector,
  selectors,
  flattenedChildStyles,
  hasMissingSelector,
  isMissingSelector,
  editStyle,
  createStyle,
  setProperty,
  setValue,
  saveStyle,
  removeStyle,
  isEditing,
  nonInheritedProperties,
  editStyles,
} = useEditComponentChildStyles({ component })

const collapsed = computed(
  () => !!editor.value?.componentMenuCollapses?.[ComponentMenuCollapsible.ChildStyles],
)

const toggleCollapse = () => {
  setComponentMenuCollapses(
    editor.value,
    ComponentMenuCollapsible.ChildStyles,
    !collapsed.value,
  )
}

const currentSelectorMissing = computed(
  () =>
    !!selector.value &&
    !component.value.children?.some((child) => child.id === selector.value),
)

const labelEnter = (id: string) => {
  runtimeContext.hoveredComponentIdInComponentTree.value = id
}

const labelLeave = () => {
  runtimeContext.hoveredComponentIdInComponentTree.value = undefined
}

const styleRowHeight = computed(() => {
  const getEditingHeight = (prop: string): number => {
    const val = flattenedChildStyles.value[prop as Css]?.value ?? ''
    const wrap = prop.length > 16 || val.length > 12
    return wrap ? 91 : 51
  }
  const editing = Array.from(editStyles.value ?? [])
  const editHeight = editing.map(getEditingHeight).reduce((prev, cur) => prev + cur, 0)
  const viewing = styleEntries.value.length - editing.length
  return editHeight + viewing * 37
})

const setSelector = (sel: string | undefined) => {
  selector.value = sel
  if (collapsed.value) {
    collapsed.value = false
  }
}

const addStyle = () => {
  setComponentMenuCollapses(editor.value, ComponentMenuCollapsible.ChildStyles, false)
  createStyle()
}

const removeSelector = () => {
  if (selector.value) {
    removeComponentOverrideStyle(selector.value)
    selector.value = undefined
  }
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.child-styles {
  padding: 0 16px;
  width: 100%;
}
.selector {
  @mixin text 13px;
  width: 120px;
  margin: 0 auto 0 6px;
  .missing-selector {
    color: $color-error;
  }
  &.has-missing-selector {
    border-color: $color-error;
  }
  &.current-selector-missing {
    :deep(.label-text) {
      color: $color-error;
    }
    :deep(.caret) {
      background-color: $color-error;
    }
  }
}
.missing-info,
.missing-info-current {
  margin-left: 4px;
}
.delete-selector {
  width: 22px;
  height: 22px;
  cursor: pointer;
  margin-left: 4px;
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
