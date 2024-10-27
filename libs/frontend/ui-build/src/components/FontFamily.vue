<template>
  <STMultiselect
    v-slot="{ label }"
    :customLabel="true"
    :value="fontFamily?.value"
    :placeholder="t('toolbar.font_family')"
    :options="options"
    :clearable="!inherited"
    :caret="false"
    toggleId="style-menu"
    :emptyText="t('toolbar.no_fonts')"
    :openControl="() => editor?.editorDropdown === EditorDropdown.FontFamily"
    class="font-family-select"
    :class="{ inherited }"
    @select="setFontFamily"
    @selectEmpty="showFontMenu"
    @open="setEditorDropdown(editor, EditorDropdown.FontFamily)"
    @close="setEditorDropdown(editor, undefined)"
  >
    <div
      :class="{ 'add-font': label === addFontText }"
      :style="{ 'font-family': label === addFontText ? undefined : font(label) }"
    >
      {{ label }}
    </div>
  </STMultiselect>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STMultiselect } from '@samatech/vue-components'
import {
  Css,
  EditorDropdown,
  EditorMode,
  StyleSourceType,
  ThemeTab,
} from '@pubstudio/shared/type-site'
import { useBuild, useToolbar } from '@pubstudio/frontend/feature-build'
import {
  setEditorDropdown,
  setThemeTab,
  toggleEditorMenu,
} from '@pubstudio/frontend/data-access-command'

const { t } = useI18n()
const { site, editor } = useBuild()
const { getResolvedOrSelectedStyle, setStyle } = useToolbar()

const addFontText = t('toolbar.add_font')

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

const showFontMenu = async () => {
  setEditorDropdown(editor.value, undefined)
  toggleEditorMenu(editor.value, EditorMode.Theme, true)
  await nextTick()
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
  if (editor.value?.editorDropdown === EditorDropdown.FontFamily) {
    setEditorDropdown(editor.value, undefined)
  }
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.font-family-select {
  @mixin title-medium 13px;
  width: 50%;
  margin: 0 0 0 4px;
  :deep(.multiselect-placeholder) {
    padding: 0 0 0 6px;
  }
  :deep(.multiselect-single-label) {
    padding: 0 0 0 6px;
  }
  :deep(.dropdown) {
    z-index: $z-index-toolbar-dropdown1;
  }
}
.add-font {
  color: $grey-700;
}
.inherited {
  :deep(.st-ms-label-text) {
    color: $color-disabled;
  }
}
</style>
