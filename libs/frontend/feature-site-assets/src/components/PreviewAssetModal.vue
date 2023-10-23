<template>
  <Modal :show="show" cls="preview-asset-modal" @cancel="emit('cancel')">
    <PSAsset :asset="assetUrl" :asImg="true" class="preview-asset" />
  </Modal>
</template>

<script lang="ts" setup>
import { Modal, PSAsset } from '@pubstudio/frontend/ui-widgets'

const props = defineProps<{
  show: boolean
  assetUrl: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()
</script>

<style lang="postcss">
.preview-asset-modal {
  .modal-inner {
    width: auto;
    max-width: 80vw;
  }
  .preview-asset {
    max-height: 80vh;
    height: 500px;
  }
  .modal-close {
    top: 1px;
    right: 2px;
  }
}
</style>
