<template>
  <div class="component-styles">
    <EditMenuTitle
      :title="t('style.styles')"
      :collapsed="collapsed"
      @add="setEditStyle('')"
      @toggleCollapse="collapsed = !collapsed"
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
        v-if="showNewStyle"
        :editing="true"
        class="new-style menu-row"
        :focusProp="true"
        @save="addStyle"
        @remove="setEditStyle(undefined)"
      />
      <StyleRow
        v-for="entry in styleEntries"
        :key="`${entry.pseudoClass}-${entry.property}-${entry.value}`"
        :style="entry"
        :editing="editing(entry.property)"
        :error="!resolveThemeVariables(site.context, entry.value)"
        :inheritedFrom="getInheritedFrom(entry)"
        class="menu-row"
        @edit="setEditStyle"
        @save="updateStyle(entry, $event)"
        @remove="removeStyle(entry)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import {
  setComponentEditStyle,
  setStyleToolbarMenu,
} from '@pubstudio/frontend/feature-editor'
import { resolveThemeVariables } from '@pubstudio/frontend/util-builtin'
import {
  Css,
  IInheritedStyleEntry,
  IStyleEntry,
  StyleSourceType,
  StyleToolbarMenu,
} from '@pubstudio/shared/type-site'
import { activeBreakpoint } from '@pubstudio/frontend/feature-site-source'
import { IconTooltipDelay, ScaleIn } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '../../lib/use-build'
import StyleRow from '../StyleRow.vue'
import EditMenuTitle from '../EditMenuTitle.vue'
import { useReusableStyleMenu } from '../../lib/use-reusable-style-menu'
import { omitSourceBreakpointId } from '@pubstudio/frontend/util-component'

const { t } = useI18n()
const {
  site,
  editor,
  currentPseudoClass,
  selectedComponentFlattenedStyles,
  setPositionAbsolute,
  setComponentCustomStyle,
  removeComponentCustomStyle,
} = useBuild()
const { newStyle } = useReusableStyleMenu()

const toMixinRef = ref()
const collapsed = ref(false)

const styleEntries = computed(() =>
  Object.entries(selectedComponentFlattenedStyles.value).map(
    ([css, source]) =>
      ({
        pseudoClass: currentPseudoClass.value,
        property: css as Css,
        value: source.value,
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        sourceBreakpointId: source.sourceBreakpointId,
      }) as IInheritedStyleEntry,
  ),
)

const menuSubTitle = computed(() => `(${currentPseudoClass.value})`)

const styleRowHeight = computed(() => {
  const entries = 37 * styleEntries.value.length
  const editing = !!editor.value?.componentTab.editStyle
  const newStyle = showNewStyle.value || editing ? 51 : 0
  return entries + newStyle
})

const clickSubTitle = () => {
  const newVal =
    editor.value?.styleMenu === StyleToolbarMenu.PseudoClass
      ? undefined
      : StyleToolbarMenu.PseudoClass
  setStyleToolbarMenu(editor.value, newVal)
}

const setEditStyle = (propName: string | undefined) => {
  setComponentEditStyle(editor.value, propName)
}

const setStyle = (oldStyle: IStyleEntry | undefined, newStyle: IStyleEntry) => {
  const newStyleEntry = { ...newStyle }

  if (newStyle.property === Css.Position && newStyle.value === 'absolute') {
    // Makes sure the parent has `relative` or `absolute` style.
    // Otherwise the component might jump to an unexpected location
    setPositionAbsolute(oldStyle, newStyleEntry)
  } else {
    setComponentCustomStyle(oldStyle, newStyleEntry)
  }
}

const updateStyle = (oldStyle: IInheritedStyleEntry, newStyle: IStyleEntry) => {
  const oldStyleEntry: IStyleEntry | undefined =
    oldStyle.sourceBreakpointId === activeBreakpoint.value.id
      ? omitSourceBreakpointId(oldStyle)
      : undefined

  setStyle(oldStyleEntry, newStyle)
  setEditStyle(undefined)
}

const removeStyle = (style: IStyleEntry) => {
  removeComponentCustomStyle(style)
  setEditStyle(undefined)
}

const showNewStyle = computed(() => {
  return editor.value?.componentTab.editStyle === ''
})

const editing = (propName: string) => {
  return editor.value?.componentTab.editStyle === propName
}

const addStyle = (newStyle: IStyleEntry) => {
  newStyle.pseudoClass = currentPseudoClass.value
  setStyle(undefined, newStyle)
  setEditStyle(undefined)
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
