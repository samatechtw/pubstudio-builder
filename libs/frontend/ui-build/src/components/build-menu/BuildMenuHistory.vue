<template>
  <div class="history-menu scrollbar-small">
    <div class="top">
      <div class="title">
        {{ t('history.title') }}
      </div>
      <PSButton
        :text="t('clear')"
        size="small"
        class="clear-button"
        @click="showClearModal = true"
      />
    </div>
    <div v-if="noCommands" class="no-history">
      {{ t('history.empty') }}
    </div>
    <div v-else class="subtitle">
      {{ t('history.subtitle') }}
    </div>
    <div class="commands">
      <HistoryRow
        v-for="(forward, index) in forwardHistory"
        :key="`f${index}`"
        :command="forward"
        @click="redoN(site, forwardHistory.length - index)"
      />
      <HistoryRow
        v-for="(back, index) in backHistory"
        :key="`b${index}`"
        :command="back"
        :isCurrent="index === 0"
        @click="undoN(site, index)"
      />
      <HistoryRow
        v-if="!noCommands"
        :command="{ type: 'initial' as CommandType, data: {} }"
        :isCurrent="backHistory.length === 0"
        @click="undoN(site, backHistory.length)"
      />
    </div>
    <ConfirmModal
      :show="showClearModal"
      :title="t('history.clear')"
      :text="t('history.clear_text')"
      @confirm="clearHistory"
      @cancel="showClearModal = false"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { undoN, redoN, clearAll } from '@pubstudio/frontend/data-access-command'
import { CommandType } from '@pubstudio/shared/type-command'
import { ConfirmModal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { useBuild } from '@pubstudio/frontend/feature-build'
import HistoryRow from './HistoryRow.vue'

const { t } = useI18n()
const { site } = useBuild()
const showClearModal = ref(false)

const forwardHistory = computed(() => {
  return site.value.history.forward ?? []
})

const backHistory = computed(() => {
  return [...(site.value.history.back ?? [])].reverse()
})

const noCommands = computed(
  () => forwardHistory.value.length === 0 && backHistory.value.length === 0,
)

const clearHistory = () => {
  showClearModal.value = false
  clearAll(site.value)
}
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.history-menu {
  @mixin flex-col;
  height: 100%;
  width: $left-menu-width;
  background-color: $blue-100;
  padding: 16px 8px 0;
}
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 8px;
}
.title {
  @mixin title-semibold 15px;
}
.clear-button {
  height: 32px;
  padding: 1px 12px 0;
  width: 64px;
  min-width: 72px;
}
.subtitle {
  @mixin title-medium 13px;
  color: $grey-700;
}
.commands {
  margin-top: 8px;
}
> div:not(:first-child) {
  margin-top: 4px;
}
.no-history {
  @mixin title-medium 15px;
  color: $grey-500;
}
</style>
