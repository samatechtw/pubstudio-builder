<template>
  <Modal :show="show" cls="preview-asset-modal" @cancel="emit('cancel')">
    <PSAsset
      :asset="assetUrl"
      :asImg="true"
      :style="{ 'background-color': bgColor }"
      class="preview-asset"
      @click="toggleBg"
    />
  </Modal>
</template>

<script lang="ts" setup>
import { Modal, PSAsset } from '@pubstudio/frontend/ui-widgets'
import { ref } from 'vue'

defineProps<{
  show: boolean
  assetUrl: string
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const bgColor = ref('white')

const toggleBg = () => {
  bgColor.value = bgColor.value === 'white' ? 'black' : 'white'
}
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
  .preview-asset {
    min-width: 400px;
    transition: all 0.2s ease;
    cursor: pointer;
  }
}
</style>
