<template>
  <div class="page-menu-tabs">
    <div class="ps-tabs">
      <div
        v-for="tab in PageTab"
        :key="tab"
        :class="['ps-tab', `ps-tab-${tab}`, activeTab === tab && 'ps-tab-active']"
        @click="activeTab = tab"
      >
        {{ t(tab) }}
      </div>
    </div>
    <component :is="tabContent" class="page-tab-content" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageMeta from './PageMeta.vue'
import PageMenuView from './PageMenuView.vue'

enum PageTab {
  Info = 'build.info',
  Meta = 'theme.meta',
}

const { t } = useI18n()

const activeTab = ref(PageTab.Info)

const tabContent = computed(() => {
  const content = {
    [PageTab.Info]: PageMenuView,
    [PageTab.Meta]: PageMeta,
  }
  return content[activeTab.value]
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.page-tab-content {
  margin-top: 16px;
}
</style>
