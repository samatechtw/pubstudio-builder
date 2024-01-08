<template>
  <Modal
    cls="ps-alert-modal"
    :show="show"
    :cancelByClickingOutside="false"
    @cancel="emit('done')"
  >
    <div class="modal-title">
      {{ title }}
    </div>
    <div class="modal-text">
      {{ text || '' }}
    </div>
    <PSButton class="ps-alert-modal-done-button" :text="t('ok')" @click="emit('done')" />
  </Modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'petite-vue-i18n'
import Modal from './Modal.vue'
import PSButton from '../form/PSButton.vue'

const { t } = useI18n()

defineProps<{
  show: boolean
  title: string
  text?: string
}>()

const emit = defineEmits<{
  (e: 'done'): void
}>()
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.ps-alert-modal {
  .modal-title {
    text-align: center;
  }
  .modal-text {
    text-align: center;
  }
  .ps-alert-modal-done-button {
    width: 100%;
    margin-top: 32px;
  }
}
</style>
