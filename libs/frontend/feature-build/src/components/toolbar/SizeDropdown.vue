<template>
  <div class="size-wrap toolbar-menu" data-toggle-id="toggle-style-menu">
    <ToolbarItem :ref="setToggleRef" :active="opened" @click="toggleMenu">
      <Size />
    </ToolbarItem>
    <div
      ref="menuRef"
      class="ps-dropdown size-dropdown"
      :class="{ 'ps-dropdown-opened': opened }"
      :style="menuStyle"
    >
      <div class="size-row">
        <div class="size-label label-title">
          {{ t('build.width') }}
        </div>
        <SizeInput
          :cssProp="Css.Width"
          class="size"
          @update="setStyle(Css.Width, $event)"
        />
        <div class="size-label">
          {{ t('build.min') }}
        </div>
        <SizeInput
          :cssProp="Css.MinWidth"
          class="size"
          @update="setStyle(Css.MinWidth, $event)"
        />
        <div class="size-label">
          {{ t('build.max') }}
        </div>
        <SizeInput
          :cssProp="Css.MaxWidth"
          class="size"
          @update="setStyle(Css.MaxWidth, $event)"
        />
      </div>
      <div class="divider" />
      <div class="size-row">
        <div class="size-label label-title">
          {{ t('build.height') }}
        </div>
        <SizeInput
          :cssProp="Css.Height"
          class="size"
          @update="setStyle(Css.Height, $event)"
        />
        <div class="size-label">
          {{ t('build.min') }}
        </div>
        <SizeInput
          :cssProp="Css.MinHeight"
          class="size"
          @update="setStyle(Css.MinHeight, $event)"
        />
        <div class="size-label">
          {{ t('build.max') }}
        </div>
        <SizeInput
          :cssProp="Css.MaxHeight"
          class="size"
          @update="setStyle(Css.MaxHeight, $event)"
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
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDropdown } from '@pubstudio/frontend/util-dropdown'
import { ToolbarItem, Size } from '@pubstudio/frontend/ui-widgets'
import { Eye, Hide, Scroll } from '@pubstudio/frontend/ui-widgets'
import { Css, StyleToolbarMenu } from '@pubstudio/shared/type-site'
import { setStyleToolbarMenu } from '@pubstudio/frontend/feature-editor'
import { useBuild } from '../../lib/use-build'
import { useToolbar } from '../../lib/use-toolbar'
import SizeInput from './SizeInput.vue'
import PaddingMarginEdit from './PaddingMarginEdit.vue'
import { usePaddingMarginEdit } from '../../lib/use-padding-margin-edit'

const { t } = useI18n()
const { editor } = useBuild()
const { getStyleValue, setStyle } = useToolbar()

const { disableClose } = usePaddingMarginEdit()

const { setToggleRef, menuRef, opened, menuStyle, setMenuOpened } = useDropdown({
  clickawayIgnoreSelector: 'div[data-toggle-id="toggle-style-menu"]',
  offset: { mainAxis: 2, crossAxis: 6 },
  openedInit: editor.value?.styleMenu === StyleToolbarMenu.Size,
  disableClose,
  openChanged: (open: boolean) => {
    // When useDropdown internal clickaway hides the menu, it's necessary to sync state
    if (!open && editor.value?.styleMenu === StyleToolbarMenu.Size) {
      setStyleToolbarMenu(editor.value, undefined)
    }
  },
})

watch(
  () => editor.value?.styleMenu,
  (newMenu) => {
    setMenuOpened(newMenu === StyleToolbarMenu.Size)
  },
)

const toggleMenu = () => {
  const menu = editor.value?.styleMenu
  const newMenu = menu === StyleToolbarMenu.Size ? undefined : StyleToolbarMenu.Size
  setStyleToolbarMenu(editor.value, newMenu)
  setMenuOpened(!!newMenu)
}

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
  setStyle(Css.Overflow, getStyleValue(Css.Overflow) === value ? undefined : value)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.size-wrap {
  .size-dropdown {
    width: 326px;
    padding: 8px 12px;
  }
}
.divider {
  @mixin divider;
  margin: 6px 0 8px;
}
.size-row {
  @mixin flex-center;
  justify-content: center;
  padding: 6px 0 6px 8px;
}
.size-label {
  @mixin title 13px;
  color: $color-text;
  width: 40px;
  text-align: right;
}
.label-title {
  font-weight: 600;
}
.size {
  margin-left: 6px;
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
