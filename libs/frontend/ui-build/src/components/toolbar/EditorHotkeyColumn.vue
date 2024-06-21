<template>
  <div class="state-col">
    <div v-for="state in states" :key="state" class="state">
      <div class="state-title">
        {{ t(`hotkey.${state}`) }}
      </div>
      <EditorHotkey
        v-for="[action, hotkey] in Object.entries(InvertedHotkeys[state] ?? {})"
        :key="invertedEditorHotkeys[state]?.[action] ?? hotkey"
        :state="state"
        :defaultHotkey="hotkey"
        :action="action"
      >
        {{ t(`actions.${action}`) }}
      </EditorHotkey>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import { HotkeyStates } from '@pubstudio/shared/type-site'
import EditorHotkey from './EditorHotkey.vue'
import { InvertedHotkeys, useEditHotkey } from '@pubstudio/frontend/feature-build'

const { t } = useI18n()

const { invertedEditorHotkeys } = useEditHotkey()

defineProps<{ states: HotkeyStates[] }>()
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.state-col {
  @mixin flex-col;
  width: 33.3%;
  &:not(:first-child) {
    padding-left: 8px;
  }
}
.state {
  @mixin flex-col;
  @mixin text 14px;
}
.state-title {
  @mixin title-bold 14px;
  color: $color-primary;
  margin-top: 12px;
}
</style>
