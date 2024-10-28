<template>
  <Modal :show="show" cls="export-i18n-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('i18n.export') }}
    </div>
    <div class="modal-text">
      {{ t('i18n.export_text') }}
    </div>
    <STInput
      v-model="fileName"
      name="export"
      class="export-filename"
      :placeholder="t('enter')"
      @keydown.enter="exportI18n"
    />
    <ErrorMessage v-if="exportError" :error="exportError" />
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        :text="t('confirm')"
        :animate="exporting"
        @click="exportI18n"
      />
      <PSButton
        class="cancel-button"
        :text="t('cancel')"
        :secondary="true"
        @click="emit('cancel')"
      />
    </div>
  </Modal>
</template>

<script lang="ts" setup>
import { onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'petite-vue-i18n'
import { STInput } from '@samatech/vue-components'
import { ErrorMessage, Modal, PSButton } from '@pubstudio/frontend/ui-widgets'
import { defaultFileName, useExportTranslations } from '../lib/use-export-translations'
import { useSiteSource } from '@pubstudio/frontend/feature-site-store'

const i18n = useI18n()
const { t } = i18n
const { site } = useSiteSource()

const props = defineProps<{
  show: boolean
}>()
const { show } = toRefs(props)
const { exportTranslations, exporting, exportError } = useExportTranslations()

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const fileName = ref('')

const exportI18n = async () => {
  exportTranslations(fileName.value, site.value.context.i18n)
  emit('cancel')
}

watch(show, (newShow) => {
  exportError.value = undefined
  if (newShow) {
    fileName.value = defaultFileName(site.value.name)
  }
})

onMounted(() => {
  fileName.value = defaultFileName(site.value.name)
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.export-i18n-modal {
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
