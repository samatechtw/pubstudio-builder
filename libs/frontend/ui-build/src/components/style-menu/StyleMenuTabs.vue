<template>
  <div class="style-menu-tabs">
    <div class="style-title menu-row menu-subtitle">
      <div class="label">
        {{ t('style.styles') }}
      </div>
      <img :src="IcX" class="style-close" @click.stop="closeStyleMenu" />
    </div>
    <div class="ps-tabs">
      <div
        v-for="tab in StyleTab"
        :key="tab"
        :class="['ps-tab', `ps-tab-${tab}`, activeTab === tab && 'ps-tab-active']"
        @click="setStyleTab(editor, tab)"
      >
        {{ t(`style.${tab}`) }}
      </div>
    </div>
    <component :is="tabContent" class="style-tab-content" />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { EditorMode, StyleTab } from '@pubstudio/shared/type-site'
import { useBuild } from '@pubstudio/frontend/feature-build'
import { setStyleTab, toggleEditorMenu } from '@pubstudio/frontend/data-access-command'
import IcX from '@frontend-assets/icon/x.svg'
import StyleMenuList from './StyleMenuList.vue'
import GlobalStyles from './GlobalStyles.vue'

const { t } = useI18n()
const { editor } = useBuild()

const activeTab = computed(() => {
  return editor.value?.styleTab ?? StyleTab.Reusable
})

const tabContent = computed(() => {
  const content = {
    [StyleTab.Reusable]: StyleMenuList,
    [StyleTab.Global]: GlobalStyles,
  }
  return content[activeTab.value]
})

const closeStyleMenu = () => {
  toggleEditorMenu(editor.value, EditorMode.SelectedComponent, true)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.style-tab-content {
  margin-top: 16px;
}
.style-close {
  @mixin size 18px;
  cursor: pointer;
}
</style>
