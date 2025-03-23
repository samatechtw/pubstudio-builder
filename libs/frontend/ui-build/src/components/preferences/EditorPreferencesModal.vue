<template>
  <Modal cls="editor-prefs-modal" :cancelWithEscape="false" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('toolbar.prefs') }}
    </div>
    <div class="prefs-menu-tabs">
      <div class="ps-tabs">
        <div
          v-for="tab in PreferenceTab"
          :key="tab"
          :class="['ps-tab', `ps-tab-${tab}`, activeTab === tab && 'ps-tab-active']"
          @click="activeTab = tab"
        >
          {{ t(tab) }}
        </div>
      </div>
      <component :is="tabContent" class="page-tab-content" @cancel="emit('cancel')" />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { Modal } from '@pubstudio/frontend/ui-widgets'
import PreferenceGeneral from './PreferenceGeneral.vue'
import PreferenceHotkeys from './PreferenceHotkeys.vue'

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

enum PreferenceTab {
  General = 'toolbar.general',
  Hotkeys = 'toolbar.hotkeys',
}

const { t } = useI18n()

const activeTab = ref(PreferenceTab.General)

const tabContent = computed(() => {
  const content = {
    [PreferenceTab.General]: PreferenceGeneral,
    [PreferenceTab.Hotkeys]: PreferenceHotkeys,
  }
  return content[activeTab.value]
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.editor-prefs-modal {
  .modal-inner {
    @mixin flex-col;
    width: 680px;
    max-width: 95%;
    max-height: 95%;
    height: 95%;
    overflow-y: scroll;
    padding: 24px 24px 0;
  }
  .modal-title {
    @mixin title 26px;
  }
  .prefs-menu-tabs {
    @mixin flex-col;
    height: 100%;
  }
}
</style>
