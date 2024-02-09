<template>
  <div class="theme-menu-tabs">
    <div class="theme-title menu-row menu-subtitle">
      <div class="label">
        {{ t('theme.title') }}
      </div>
      <img :src="IcX" class="theme-close" @click.stop="closeThemeMenu" />
    </div>
    <div class="ps-tabs">
      <div
        v-for="tab in ThemeTab"
        :key="tab"
        :class="['ps-tab', `ps-tab-${tab}`, activeTab === tab && 'ps-tab-active']"
        @click="setThemeTab(editor, tab)"
      >
        {{ t(`theme.${tab}`) }}
      </div>
    </div>
    <component :is="tabContent" class="theme-tab-content" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { EditorMode, ThemeTab } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setThemeTab, toggleEditorMenu } from '@pubstudio/frontend/util-command'
import IcX from '@frontend-assets/icon/x.svg'
import ThemeVariables from './ThemeVariables.vue'
import ThemeFonts from './ThemeFonts.vue'
import ThemeMeta from './ThemeMeta.vue'

const { t } = useI18n()
const { editor } = useBuild()

const activeTab = computed(() => {
  return editor.value?.themeTab ?? ThemeTab.Variables
})

const tabContent = computed(() => {
  const content = {
    [ThemeTab.Variables]: ThemeVariables,
    [ThemeTab.Fonts]: ThemeFonts,
    [ThemeTab.Meta]: ThemeMeta,
  }
  return content[activeTab.value]
})

const closeThemeMenu = () => {
  toggleEditorMenu(editor.value, EditorMode.SelectedComponent, true)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-menu-tabs {
  .theme-tab-content {
    margin-top: 16px;
  }
}
.theme-close {
  @mixin size 18px;
  cursor: pointer;
}
</style>
