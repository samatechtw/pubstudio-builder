<template>
  <Modal cls="editor-prefs-modal" :cancelWithEscape="false" @cancel="emit('cancel')">
    <EditorPreferences @cancel="emit('cancel')" />
  </Modal>
</template>

<script lang="ts" setup>
import { Modal } from '@pubstudio/frontend/ui-widgets'
import EditorPreferences from './EditorPreferences.vue'

const emit = defineEmits<{
  (e: 'cancel'): void
}>()
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
  }
  .modal-title {
    @mixin title 26px;
  }
}
</style>
