<template>
  <Modal :show="show" cls="export-table-modal" @cancel="emit('cancel')">
    <div class="modal-title">
      {{ t('custom_data.export_title') }}
    </div>
    <div class="modal-text">
      {{ t('custom_data.export_text') }}
    </div>
    <STInput
      v-model="fileName"
      name="export"
      class="export-filename"
      :placeholder="t('enter')"
      @keydown.enter="exportTable"
    />
    <ErrorMessage v-if="exportError" :error="exportError" />
    <div class="modal-buttons">
      <PSButton
        class="confirm-button"
        :text="t('confirm')"
        :animate="exporting"
        @click="exportTable"
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
import { ICustomTableColumn } from '@pubstudio/shared/type-api-site-custom-data'
import { defaultFileName, useExportTable } from '../lib/use-export-table'

const i18n = useI18n()
const { t } = i18n

const props = defineProps<{
  tableName: string | undefined
  columns: ICustomTableColumn[]
  siteId: string
  show: boolean
}>()
const { columns, tableName, siteId, show } = toRefs(props)
const {
  exportTable: exportTableApi,
  exporting,
  exportError,
} = useExportTable(siteId.value)

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const fileName = ref('')

const exportTable = async () => {
  await exportTableApi(fileName.value, tableName.value, columns.value)
  emit('cancel')
}

watch(show, (newShow) => {
  exportError.value = undefined
  if (newShow) {
    fileName.value = defaultFileName(tableName.value)
  }
})

onMounted(() => {
  fileName.value = defaultFileName(tableName.value)
})
</script>

<style lang="postcss">
@import '@theme/css/mixins.postcss';

.export-table-modal {
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
  .export-types {
    @mixin flex-col;
    @mixin title-normal 14px;
    margin-top: 4px;
    color: black;
  }
  .export-type {
    margin-top: 6px;
    cursor: pointer;
  }
}
</style>
