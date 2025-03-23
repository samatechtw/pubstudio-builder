<template>
  <div class="editor-hotkeys">
    <div class="modal-text" v-html="t('toolbar.prefs_text')"></div>
    <div class="states">
      <EditorHotkeyColumn :states="col1States" />
      <EditorHotkeyColumn :states="col2States" />
      <EditorHotkeyColumn :states="col3States" />
    </div>
    <div class="modal-buttons">
      <PSButton
        :text="t('done')"
        class="close-button"
        size="small"
        :secondary="true"
        @click="emit('cancel')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { PSButton } from '@pubstudio/frontend/ui-widgets'
import { HotkeyStates } from '@pubstudio/shared/type-site'
import EditorHotkeyColumn from './EditorHotkeyColumn.vue'
import { useEditHotkey } from '@pubstudio/frontend/feature-build'
import { onUnmounted } from 'vue'

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const { t } = useI18n()
const { clearEditing } = useEditHotkey()

const col1States = [
  HotkeyStates.None,
  HotkeyStates.Pages,
  HotkeyStates.Theme,
  HotkeyStates.Assets,
]

const col2States = [HotkeyStates.ComponentBasic, HotkeyStates.Style, HotkeyStates.History]

const col3States = [
  HotkeyStates.ComponentAdvanced,
  HotkeyStates.CustomComponents,
  HotkeyStates.Behavior,
  HotkeyStates.File,
]

onUnmounted(() => {
  clearEditing()
})
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.states {
  display: flex;
  flex-wrap: wrap;
  color: black;
  margin-bottom: 24px;
}
.modal-text {
  @mixin text-medium 16px;
  color: $grey-700;
}
.modal-buttons {
  @mixin flex-row;
  justify-content: center;
  margin-top: auto;
  padding-bottom: 24px;
}
</style>
