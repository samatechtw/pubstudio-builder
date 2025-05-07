<template>
  <Modal cls="confirm-modal" @cancel="emit('cancel')">
    <div v-if="title" class="modal-title">
      {{ title }}
    </div>
    <div class="modal-text">
      <slot name="text" />
      {{ text ?? '' }}
    </div>
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        :text="confirmText ?? t('confirm')"
        :animate="loading"
        @click="emit('confirm')"
      />
      <PSButton
        class="cancel-button"
        :text="cancelText ?? t('cancel')"
        :secondary="true"
        @click="emit('cancel', true)"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import Modal from './Modal.vue'
import PSButton from '../form/PSButton.vue'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel', fromButton?: boolean): void
}>()

withDefaults(
  defineProps<{
    title?: string
    text?: string
    loading?: boolean
    confirmText?: string
    cancelText?: string
  }>(),
  {
    title: undefined,
    text: undefined,
    confirm: undefined,
    cancelText: undefined,
  },
)
</script>

<style lang="postcss" scoped>
@import '@theme/css/mixins.postcss';

.modal-buttons {
  @mixin flex-row;
}
:slotted(.confirm-button) {
  margin-right: 8px;
  min-width: 94px;
}
:slotted(.cancel-button) {
  margin-left: 8px;
}
.cancel-button {
  margin-left: 8px;
}
</style>
