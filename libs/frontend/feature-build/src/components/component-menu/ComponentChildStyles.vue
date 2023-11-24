<template>
  <div class="child-styles">
    <EditMenuTitle
      :title="t('style.child')"
      :collapsed="collapsed"
      :showAdd="selector !== undefined"
      @add="setEditStyle('')"
      @toggleCollapse="collapsed = !collapsed"
    >
      <InfoBubble :message="t('style.child_info')" placement="top" class="info" />
      <PSMultiselect
        v-slot="{ label }"
        :value="selector"
        :options="selectors"
        :placeholder="t('style.selector')"
        :customLabel="true"
        class="selector"
        @select="setSelector"
        @close="labelLeave"
      >
        <div @mouseenter="labelEnter(label)" @mouseleave="labelLeave">
          {{ label }}
        </div>
      </PSMultiselect>
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
        :error="!resolveThemeVariables(site.context, entry.value)"
        class="menu-row"
        @edit="setEditStyle"
        @save="updateStyle(entry, $event)"
        @remove="removeStyle(entry)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { InfoBubble, PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import {
  Css,
  IComponent,
  IInheritedStyleEntry,
  IStyleEntry,
} from '@pubstudio/shared/type-site'
import EditMenuTitle from '../EditMenuTitle.vue'
import { useBuild } from '../../lib/use-build'
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

const { t } = useI18n()
const {
  site,
  editor,
  currentPseudoClass,
  setOverrideStyle,
  removeComponentOverrideStyle,
} = useBuild()

const props = defineProps<{
  component: IComponent
}>()
const { component } = toRefs(props)

const selector = ref()
const collapsed = ref(true)
const editStyleProp = ref<string | undefined>()

const selectors = computed(() => {
  return (component.value.children ?? []).map((c) => c.id)
})

const showNewStyle = computed(() => {
  return editStyleProp.value === ''
})

const editing = (propName: string) => {
  return editStyleProp.value === propName
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

const setSelector = (sel: string | undefined) => {
  selector.value = sel
  if (collapsed.value) {
    collapsed.value = false
  }
}

const setEditStyle = (prop: string | undefined) => {
  editStyleProp.value = prop
  if (collapsed.value && prop !== undefined) {
    collapsed.value = false
  }
}

const updateStyle = (oldStyle: IInheritedStyleEntry, newStyle: IStyleEntry) => {
  const oldStyleEntry: IStyleEntry | undefined =
    oldStyle.sourceBreakpointId === activeBreakpoint.value.id
      ? omitSourceBreakpointId(oldStyle)
      : undefined

  setOverrideStyle(selector.value, oldStyleEntry, newStyle)
  setEditStyle(undefined)
}

const addStyle = (newStyle: IStyleEntry) => {
  newStyle.pseudoClass = currentPseudoClass.value
  setOverrideStyle(selector.value, undefined, newStyle)
  setEditStyle(undefined)
}

const removeStyle = (style: IStyleEntry) => {
  removeComponentOverrideStyle(selector.value, style)
  setEditStyle(undefined)
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
