<template>
  <PSMultiselect
    v-slot="{ label }"
    :customLabel="true"
    :value="fontFamily?.value"
    :placeholder="t('style.toolbar.font_family')"
    :options="options"
    :clearable="!inherited"
    :caret="false"
    toggleId="style-menu"
    :emptyText="t('style.toolbar.no_fonts')"
    :openControl="() => editor?.styleMenu === StyleToolbarMenu.FontFamily"
    class="font-family-select"
    :class="{ inherited }"
    @select="setFontFamily"
    @selectEmpty="showFontMenu"
    @open="setStyleToolbarMenu(editor, StyleToolbarMenu.FontFamily)"
    @close="setStyleToolbarMenu(editor, undefined)"
  >
    <div :style="{ 'font-family': label === addFontText ? undefined : font(label) }">
      {{ label }}
    </div>
  </PSMultiselect>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { PSMultiselect } from '@pubstudio/frontend/ui-widgets'
import {
  Css,
  EditorMode,
  StyleSourceType,
  StyleToolbarMenu,
  ThemeTab,
} from '@pubstudio/shared/type-site'
import { useBuild, useToolbar } from '@pubstudio/frontend/feature-build'
import {
  setStyleToolbarMenu,
  setThemeTab,
  toggleEditorMenu,
} from '@pubstudio/frontend/util-command'

const { t } = useI18n()
const { site, editor } = useBuild()
const { getResolvedOrSelectedStyle, setStyle } = useToolbar()

const addFontText = t('style.toolbar.add_font')

const options = computed(() => {
  const options = Object.keys(site.value.context.theme.fonts)
  if (options.length) {
    options.push(addFontText)
  }
  return options
})

const fontFamily = computed(() => {
  return getResolvedOrSelectedStyle(Css.FontFamily)
})

const inherited = computed(() => {
  return fontFamily.value?.sourceType !== StyleSourceType.Custom
})

const showFontMenu = () => {
  toggleEditorMenu(editor.value, EditorMode.Theme, true)
  setThemeTab(editor.value, ThemeTab.Fonts)
}

const setFontFamily = (family: string | undefined) => {
  if (family === addFontText) {
    showFontMenu()
  } else {
    setStyle(Css.FontFamily, family)
  }
}

const font = (label: string) => {
  return `"${label}"`
}

onMounted(() => {
  // TODO -- why is this necessary, is there a better way to handle it?
  if (editor.value?.styleMenu === StyleToolbarMenu.FontFamily) {
    setStyleToolbarMenu(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.font-family-select {
  @mixin title-medium 13px;
  width: 110px;
  margin: 0 0 0 4px;
  :deep(.multiselect-placeholder) {
    padding: 0 0 0 6px;
  }
  :deep(.multiselect-single-label) {
    padding: 0 0 0 6px;
  }
}
.inherited {
  :deep(.label-text) {
    color: $color-disabled;
  }
}
</style>
