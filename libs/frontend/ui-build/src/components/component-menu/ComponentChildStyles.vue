<template>
  <div class="child-styles">
    <EditMenuTitle
      :title="t('style.child')"
      :collapsed="collapsed"
      :showAdd="selector !== undefined && !isMissingSelector(selector)"
      @add="onAddClick"
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
        v-if="showNewStyle"
        :editing="true"
        class="new-style menu-row"
        :focusProp="true"
        @save="addStyle"
        @remove="setEditStyle(undefined)"
      />
      <StyleRow
        v-for="entry in childStyles"
        :key="`${entry.pseudoClass}-${entry.property}-${entry.value}`"
        :style="entry"
        :editing="editing(entry.property)"
        :inheritedFrom="getInheritedFrom(entry)"
        :error="!resolveThemeVariables(site.context, entry.value)"
        class="menu-row"
        @edit="setEditStyle"
        @save="updateStyle(entry, $event)"
        @remove="removeEntry(entry)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { InfoBubble, PSMultiselect, Minus } from '@pubstudio/frontend/ui-widgets'
import {
  ComponentMenuCollapsible,
  Css,
  IComponent,
  IInheritedStyleEntry,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import EditMenuTitle from '../EditMenuTitle.vue'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import {
  computeComponentOverrideStyle,
  computeComponentFlattenedStyles,
  omitSourceBreakpointId,
} from '@pubstudio/frontend/util-component'
import {
  activeBreakpoint,
  descSortedBreakpoints,
} from '@pubstudio/frontend/feature-site-source'
import StyleRow from '../StyleRow.vue'
import { runtimeContext } from '@pubstudio/frontend/util-runtime'
import { setComponentMenuCollapses } from '@pubstudio/frontend/feature-editor'

const { t } = useI18n()
const {
  site,
  editor,
  currentPseudoClass,
  setOverrideStyle,
  removeComponentOverrideStyleEntry,
  removeComponentOverrideStyle,
} = useBuild()

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const getDefaultSelector = (): string | undefined => {
  return Object.keys(component.value.style.overrides ?? {})[0]
}

const selector = ref(getDefaultSelector())
const editStyleProp = ref<string | undefined>()

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

const onAddClick = () => {
  setComponentMenuCollapses(editor.value, ComponentMenuCollapsible.ChildStyles, false)
  setEditStyle('')
}

const childrenIdSet = computed(
  () => new Set(component.value.children?.map((child) => child.id)),
)

const overriddenChildrenIdSet = computed(
  () => new Set(Object.keys(component.value.style.overrides ?? {})),
)

const selectors = computed(() => {
  const allIds = [...childrenIdSet.value, ...overriddenChildrenIdSet.value]
  const uniqueIds = new Set(allIds)
  return Array.from(uniqueIds)
})

const hasMissingSelector = computed(() => {
  const overriddenChildrenIds = Array.from(overriddenChildrenIdSet.value)
  return overriddenChildrenIds.some((id) => !childrenIdSet.value.has(id))
})

const currentSelectorMissing = computed(
  () =>
    !!selector.value &&
    !component.value.children?.some((child) => child.id === selector.value),
)

const showNewStyle = computed(() => {
  return editStyleProp.value === ''
})

const editing = (propName: string) => {
  return editStyleProp.value === propName
}

const isMissingSelector = (childId: string) => {
  return !childrenIdSet.value.has(childId)
}

const labelEnter = (id: string) => {
  runtimeContext.hoveredComponentIdInComponentTree.value = id
}

const labelLeave = () => {
  runtimeContext.hoveredComponentIdInComponentTree.value = undefined
}

const styleRowHeight = computed(() => {
  const entries = 37 * childStyles.value.length
  const editing = !!editStyleProp.value
  const newStyle = showNewStyle.value || editing ? 51 : 0
  return entries + newStyle
})

const childStyles = computed<IInheritedStyleEntry[]>(() => {
  const { selectedComponent } = site.value.editor ?? {}
  if (selectedComponent && selector.value) {
    const breakpointStyles = computeComponentOverrideStyle(
      selectedComponent,
      selector.value,
    )
    const flattenedStyles = computeComponentFlattenedStyles(
      editor.value,
      breakpointStyles,
      descSortedBreakpoints.value,
      activeBreakpoint.value,
    )
    return Object.entries(flattenedStyles).map(
      ([css, source]) =>
        ({
          pseudoClass: currentPseudoClass.value,
          property: css as Css,
          value: source.value,
          sourceType: source.sourceType,
          sourceId: source.sourceId,
          sourceBreakpointId: source.sourceBreakpointId,
        }) as IInheritedStyleEntry,
    )
  } else {
    return []
  }
})

const getInheritedFrom = (entry: IInheritedStyleEntry) => {
  if (entry.sourceBreakpointId !== activeBreakpoint.value.id) {
    return t('style.inherited_breakpoint', {
      breakpoint: site.value.context.breakpoints[entry.sourceBreakpointId]?.name,
    })
  } else {
    return undefined
  }
}

const setSelector = (sel: string | undefined) => {
  selector.value = sel
  if (collapsed.value) {
    setComponentMenuCollapses(editor.value, ComponentMenuCollapsible.ChildStyles, false)
  }
}

const setEditStyle = (prop: string | undefined) => {
  editStyleProp.value = prop
  if (collapsed.value && prop !== undefined) {
    setComponentMenuCollapses(editor.value, ComponentMenuCollapsible.ChildStyles, false)
  }
}

const updateStyle = (oldStyle: IInheritedStyleEntry, newStyle: IStyleEntry) => {
  if (selector.value) {
    const oldStyleEntry: IStyleEntry | undefined =
      oldStyle.sourceBreakpointId === activeBreakpoint.value.id
        ? omitSourceBreakpointId(oldStyle)
        : undefined

    setOverrideStyle(selector.value, oldStyleEntry, newStyle)
    setEditStyle(undefined)
  }
}

const addStyle = (newStyle: IStyleEntry) => {
  if (selector.value) {
    newStyle.pseudoClass = currentPseudoClass.value
    setOverrideStyle(selector.value, undefined, newStyle)
    setEditStyle(undefined)
  }
}

const removeEntry = (style: IStyleEntry) => {
  if (selector.value) {
    removeComponentOverrideStyleEntry(selector.value, style)
    setEditStyle(undefined)
  }
}

const removeSelector = () => {
  if (selector.value) {
    removeComponentOverrideStyle(selector.value)
    selector.value = undefined
  }
}

watch(selectors, (newSelectors) => {
  // Ensure that the current selector doesn't retain a deleted/non-existent value after selecting
  // another component, or after redoing an override style removal for a specific selector.
  if (!selector.value || (selector.value && !newSelectors.includes(selector.value))) {
    selector.value = getDefaultSelector()
  }
})
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
  height: 32px;
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
