<template>
  <div class="component-styles">
    <EditMenuTitle
      :title="t('style.styles')"
      :collapsed="collapsed"
      @add="editStyle('')"
      @toggleCollapse="collapsed = !collapsed"
    >
      <div class="sub-label" @click="clickSubTitle">
        {{ menuSubTitle }}
      </div>
      <div
        ref="itemRef"
        class="to-mixin"
        @mouseenter="tooltipMouseEnter"
        @mouseleave="tooltipMouseLeave"
      >
        <ScaleIn @click="convertToMixin"></ScaleIn>
        <div v-if="show" ref="tooltipRef" class="tooltip" :style="tooltipStyle">
          {{ t('style.to_mixin') }}
        </div>
      </div>
    </EditMenuTitle>
    <div class="style-rows" :class="{ collapsed }">
      <StyleRow
        v-if="showNewStyle"
        :editing="true"
        class="new-style menu-row"
        :focusProp="true"
        @update="addStyle"
        @remove="editStyle(undefined)"
      />
      <StyleRow
        v-for="entry in styleEntries"
        :key="`${entry.pseudoClass}-${entry.property}-${entry.value}`"
        :style="entry"
        :editing="editing(entry.property)"
        :error="!resolveThemeVariables(site.context, entry.value)"
        :inheritedFrom="getInheritedFrom(entry)"
        class="menu-row"
        @edit="editStyle"
        @update="updateStyle(entry, $event)"
        @remove="removeStyle(entry)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  setComponentEditStyle,
  setStyleToolbarMenu,
} from '@pubstudio/frontend/feature-editor'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import {
  IInheritedStyleEntry,
  IStyleEntry,
  StyleSourceType,
  StyleToolbarMenu,
} from '@pubstudio/shared/type-site'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { ScaleIn } from '@pubstudio/frontend/ui-widgets'
import { useTooltipDelay } from '@pubstudio/frontend/util-tooltip'
import { useBuild } from '../../lib/use-build'
import StyleRow from '../StyleRow.vue'
import EditMenuTitle from '../EditMenuTitle.vue'
import { useReusableStyleMenu } from '../../lib/use-reusable-style-menu'

const { t } = useI18n()
const { site, editor, currentPseudoClass } = useBuild()
const { newStyle } = useReusableStyleMenu()

const {
  itemRef,
  tooltipMouseEnter,
  tooltipMouseLeave,
  cancelHoverTimer,
  tooltipRef,
  tooltipStyle,
  show,
} = useTooltipDelay({ placement: 'top', globalShowDuration: 0 })
const collapsed = ref(false)

const props = defineProps<{
  styleEntries: IInheritedStyleEntry[]
}>()
const { styleEntries } = toRefs(props)

const emit = defineEmits<{
  (e: 'addStyle', newStyle: IStyleEntry): void
  (e: 'updateStyle', oldStyle: IStyleEntry | undefined, newStyle: IStyleEntry): void
  (e: 'removeStyle', style: IStyleEntry): void
}>()

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

const styleRowCount = computed(() => {
  return styleEntries.value.length + (showNewStyle.value ? 1 : 0)
})

const clickSubTitle = () => {
  const newVal =
    editor.value?.styleMenu === StyleToolbarMenu.PseudoClass
      ? undefined
      : StyleToolbarMenu.PseudoClass
  setStyleToolbarMenu(editor.value, newVal)
}

const editStyle = (propName: string | undefined) => {
  setComponentEditStyle(editor.value, propName)
}

const omitSourceBreakpointId = (entry: IInheritedStyleEntry): IStyleEntry => ({
  pseudoClass: entry.pseudoClass,
  property: entry.property,
  value: entry.value,
})

const updateStyle = (oldStyle: IInheritedStyleEntry, newStyle: IStyleEntry) => {
  const oldStyleEntry: IStyleEntry | undefined =
    oldStyle.sourceBreakpointId === activeBreakpoint.value.id
      ? omitSourceBreakpointId(oldStyle)
      : undefined
  emit('updateStyle', oldStyleEntry, { ...newStyle })
  setComponentEditStyle(editor.value, undefined)
}

const removeStyle = (style: IStyleEntry) => {
  emit('removeStyle', style)
  setComponentEditStyle(editor.value, undefined)
}

const showNewStyle = computed(() => {
  return editor.value?.componentTab.editStyle === ''
})

const editing = (propName: string) => {
  return editor.value?.componentTab.editStyle === propName
}

const addStyle = (newStyle: IStyleEntry) => {
  newStyle.pseudoClass = currentPseudoClass.value
  emit('addStyle', newStyle)
  editStyle(undefined)
}

const getInheritedFrom = (entry: IInheritedStyleEntry): string | undefined => {
  if (entry.sourceType === StyleSourceType.Custom) {
    if (entry.sourceBreakpointId !== activeBreakpoint.value.id) {
      return t('style.inherited_breakpoint', {
        breakpoint: site.value.context.breakpoints[entry.sourceBreakpointId]?.name,
      })
    } else {
      return undefined
    }
  } else if (entry.sourceType === StyleSourceType.Mixin) {
    return t('style.inherited_mixin', {
      mixin: site.value.context.styles[entry.sourceId]?.name,
    })
  } else if (entry.sourceType === StyleSourceType.Is) {
    const sourceName = site.value.context.components[entry.sourceId]?.name
    return t('style.inherited_source', {
      source: `${sourceName}#${entry.sourceId}`,
    })
  } else {
    return 'UNKNOWN_STYLE_SOURCE'
  }
}

const convertToMixin = () => {
  cancelHoverTimer()
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
  cursor: pointer;
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
  overflow: hidden;
  max-height: v-bind(styleRowCount * 37 + 'px');
  &.collapsed {
    max-height: 0;
  }
}
</style>
