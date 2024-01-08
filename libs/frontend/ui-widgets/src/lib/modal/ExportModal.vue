<template>
  <Modal :show="show" cls="export-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('file.export_title') }}
    </div>
    <div class="modal-text">
      {{ t('file.export_text') }}
    </div>
    <PSInput
      v-model="fileName"
      name="export"
      class="export-filename"
      :placeholder="t('enter')"
      @keydown.enter="emit('confirmExport', fileName)"
    />
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        :text="t('confirm')"
        @click="emit('confirmExport', fileName)"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        variant="secondary"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import Modal from './Modal.vue'
import PSInput from '../form/PSInput.vue'
import PSButton from '../form/PSButton.vue'

const { t } = useI18n()

const props = defineProps<{
  show: boolean
  defaultFileName: string
}>()
const { defaultFileName } = toRefs(props)

const emit = defineEmits<{
  (e: 'confirmExport', fileName: string): void
  (e: 'cancel'): void
}>()

const fileName = ref('')

onMounted(() => {
  fileName.value = defaultFileName.value
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.export-modal {
  .export-filename {
    margin-top: 16px;
  }
  .modal-buttons {
    .confirm-button {
      margin-right: 8px;
      min-width: 94px;
    }
    .cancel-button {
      margin-left: 8px;
    }
    .modal-text {
      margin: 24px 0;
    }
  }
}
</style>
