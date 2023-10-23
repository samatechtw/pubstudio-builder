<template>
  <div class="theme-menu-tabs">
    <div class="theme-title menu-row menu-subtitle">
      <div class="label">
        {{ t('theme.title') }}
      </div>
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
import { useI18n } from 'vue-i18n'
import { ThemeTab } from '@pubstudio/shared/type-site'
import { setThemeTab } from '@pubstudio/frontend/feature-editor'
import ThemeVariables from './ThemeVariables.vue'
import ThemeFonts from './ThemeFonts.vue'
import ThemeMeta from './ThemeMeta.vue'
import { useBuild } from '../../lib/use-build'

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
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.theme-menu-tabs {
  .theme-tab-content {
    margin-top: 16px;
  }
}
</style>
