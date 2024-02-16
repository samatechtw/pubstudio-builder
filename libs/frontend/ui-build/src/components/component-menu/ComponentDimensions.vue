<template>
  <div class="component-dimensions">
    <EditMenuTitle
      :title="t('build.dimensions')"
      :collapsed="collapsed"
      :showAdd="false"
      @toggleCollapse="toggleCollapse"
    />
    <div class="dimensions-wrap" :class="{ collapsed }">
      <div class="size-row">
        <div class="size-label label-title label-large">
          {{ t('build.width') }}
        </div>
        <SizeInput
          :cssProp="Css.Width"
          class="size"
          @update="updateStyle(Css.Width, $event)"
        />
        <div class="size-label">
          {{ t('build.min') }}
        </div>
        <SizeInput
          :cssProp="Css.MinWidth"
          class="size"
          @update="updateStyle(Css.MinWidth, $event)"
        />
        <div class="size-label">
          {{ t('build.max') }}
        </div>
        <SizeInput
          :cssProp="Css.MaxWidth"
          class="size"
          @update="updateStyle(Css.MaxWidth, $event)"
        />
      </div>
      <div class="divider" />
      <div class="size-row">
        <div class="size-label label-title label-large">
          {{ t('build.height') }}
        </div>
        <SizeInput
          :cssProp="Css.Height"
          class="size"
          @update="updateStyle(Css.Height, $event)"
        />
        <div class="size-label">
          {{ t('build.min') }}
        </div>
        <SizeInput
          :cssProp="Css.MinHeight"
          class="size"
          @update="updateStyle(Css.MinHeight, $event)"
        />
        <div class="size-label">
          {{ t('build.max') }}
        </div>
        <SizeInput
          :cssProp="Css.MaxHeight"
          class="size"
          @update="updateStyle(Css.MaxHeight, $event)"
        />
      </div>
      <div class="divider" />
      <div class="size-row">
        <PaddingMarginEdit />
      </div>
      <div class="divider" />
      <div class="size-row overflow">
        <div class="size-label label-title">
          {{ t('style.toolbar.overflow') }}
        </div>
        <ToolbarItem
          :active="overflowVisible"
          :tooltip="t('style.toolbar.visible')"
          @click="toggleOverflow('visible')"
        >
          <Eye />
        </ToolbarItem>
        <ToolbarItem
          :active="overflowHidden"
          :tooltip="t('style.toolbar.hidden')"
          @click="toggleOverflow('hidden')"
        >
          <Hide />
        </ToolbarItem>
        <ToolbarItem
          :active="overflowScroll"
          :tooltip="t('style.toolbar.scroll')"
          @click="toggleOverflow('scroll')"
        >
          <Scroll />
        </ToolbarItem>
        <ToolbarItem
          :active="overflowAuto"
          class="overflow-auto"
          @click="toggleOverflow('auto')"
        >
          {{ t('style.toolbar.auto') }}
        </ToolbarItem>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { ToolbarItem } from '@pubstudio/frontend/ui-widgets'
import { Eye, Hide, Scroll } from '@pubstudio/frontend/ui-widgets'
import { ComponentMenuCollapsible, Css } from '@pubstudio/shared/type-site'
import {
  useBuild,
  usePaddingMarginEdit,
  useToolbar,
} from '@pubstudio/frontend/feature-build'
import { setComponentMenuCollapses } from '@pubstudio/frontend/util-command'
import SizeInput from './SizeInput.vue'
import PaddingMarginEdit from './PaddingMarginEdit.vue'
import EditMenuTitle from '../EditMenuTitle.vue'

const { t } = useI18n()
const { editor } = useBuild()
const { getStyleValue, setOrRemoveStyle, setStyleOrReplace } = useToolbar()
const { editValueData } = usePaddingMarginEdit()

const collapsed = computed(
  () => !!editor.value?.componentMenuCollapses?.[ComponentMenuCollapsible.Dimensions],
)

const toggleCollapse = () => {
  setComponentMenuCollapses(
    editor.value,
    ComponentMenuCollapsible.Dimensions,
    !collapsed.value,
  )
}

const updateStyle = (property: Css, value: string | undefined) => {
  setStyleOrReplace(property, value)
}

const sectionHeight = computed(() => {
  return editValueData.value ? '313.5px' : '262px'
})

const overflowVisible = computed(() => {
  return getStyleValue(Css.Overflow) === 'visible'
})

const overflowHidden = computed(() => {
  return getStyleValue(Css.Overflow) === 'hidden'
})

const overflowScroll = computed(() => {
  return getStyleValue(Css.Overflow) === 'scroll'
})

const overflowAuto = computed(() => {
  return getStyleValue(Css.Overflow) === 'auto'
})

const toggleOverflow = (value: string) => {
  setOrRemoveStyle(
    Css.Overflow,
    getStyleValue(Css.Overflow) === value ? undefined : value,
  )
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.component-dimensions {
  background-color: $menu-bg2;
  padding: 0 16px 2px;
}

.dimensions-wrap {
  max-height: v-bind(sectionHeight);
  transition: max-height 0.2s;
  &.collapsed {
    max-height: 0;
    overflow: hidden;
  }
}

.size-wrap {
  .size-dropdown {
    width: 326px;
    padding: 8px 12px;
  }
}
.divider {
  @mixin divider;
  margin: 3px 0 4px;
}
.size-row {
  @mixin flex-center;
  justify-content: center;
  padding: 5px 0 4px;
}
.size-label {
  @mixin title 11px;
  color: $color-text;
  margin-top: 1px;
  min-width: 28px;
  text-align: right;
}
.label-title {
  font-weight: 600;
}
.label-large {
  min-width: 40px;
}
.size {
  margin-left: 2px;
}
.size-row.overflow {
  padding: 0;
  .size-label {
    width: 64px;
    margin-right: 8px;
  }
  > :deep(.toolbar-item) {
    @mixin size 30px;
  }
  .overflow-auto {
    width: unset;
    font-size: 12px;
  }
}
</style>
